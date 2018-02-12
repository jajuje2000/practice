import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails , CognitoIdentityCredentials} from 'amazon-cognito-identity-js';


class Textbox extends React.Component {
  render(){
      return(
          <input type="string" />
      )
  }
}

class Numberbox extends React.Component {
  render(){ 
    return(
      <input type="number" />
    )
  }
}

class Login extends React.Component {
  constructor(props)
  {
    super(props);
    this.loginFail = this.loginFail.bind(this);
    this.loginSuccess = this.loginSuccess.bind(this);
    this.state = { showGame: false, showLoginError: false, dataApi: [] }
  }

  componentDidMount(){
    fetch('https://f0lotrvq43.execute-api.us-east-2.amazonaws.com/beta/tbgames',{   
      method: 'Get'
    })
    .then(results => {
      return results.json();
    }).then(data => {
      let i = 0;
      let dataApi = data.Items[0].Details.M.Codenames.SS.map((game) => {
        i++;
        if(i < 26)
        {
          return(
            <Square gamename={game} id={i} key={i}/>
          )
        }
        
      })
      this.setState({dataApi: dataApi});
      console.log("state", this.state.dataApi)
    })
  }

  loginSuccess(){
    this.setState({ showGame: true , showLoginError: false}); 
  }

  loginFail(){
    this.setState({ showGame: false, showLoginError: true })
  }

  login(loginSuccess, loginFail){
    var authenticationData = {
      Username : this.username.value,
      Password : this.password.value,
  };
  var authenticationDetails = new AuthenticationDetails(authenticationData);
  var poolData = {
      UserPoolId : 'us-east-2_CHKFnQKV0', // Your user pool id here
      ClientId : '32qkjd6j36j7rh48c422ctjphl' // Your client id here
  };
  var userPool = new CognitoUserPool(poolData);
  var userData = {
      Username : this.username.value,
      Pool : userPool
  };
  var cognitoUser = new CognitoUser(userData);

  var AWS = require('aws-sdk');

  cognitoUser.authenticateUser(authenticationDetails, {
    
      onSuccess: function (result) {
          console.log('access token + ' + result.getAccessToken().getJwtToken());
          console.log(result);

          //POTENTIAL: Region needs to be set if not already set previously elsewhere.
          AWS.config.region = '<region>';

          AWS.config.credentials = new AWS.CognitoIdentityCredentials({
              IdentityPoolId : 'us-east-2_CHKFnQKV0', // your identity pool id here
              Logins : {
                  // Change the key below according to the specific region your user pool is in.
                  'cognito-idp.us-east-2.amazonaws.com/us-east-2_CHKFnQKV0' : result.getIdToken().getJwtToken()
              }
          });
          
          //refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
          // AWS.config.credentials.refresh((error) => {
          //     if (error) {
          //          console.error(error);
          //     } else {
          //          // Instantiate aws sdk service objects now that the credentials have been updated.
          //          // example: var s3 = new AWS.S3();
          //          console.log('Successfully logged!');
          //     }
          // });
          loginSuccess();
      },

      onFailure: function(err) {
        loginFail();
      },

      newPasswordRequired: function(userAttributes, requiredAttributes) {
        // User was signed up by an admin and must provide new
        // password and required attributes, if any, to complete
        // authentication.

        // the api doesn't accept this field back
        delete userAttributes.email_verified;

        // Get these details and call
        cognitoUser.completeNewPasswordChallenge("Practice123!@#", userAttributes, this);
    }

  }); 

  var prac = 1;
  }

  render(){
      const showGame = this.state.showGame;
      const showLoginError = this.state.showLoginError;

      let button = null;
      let loginError = null;

      loginError = showLoginError?<div><label style={{color:'red'}}>Username/Password is incorrect</label></div>:<div></div>;
      // button = showGame? 
      // <div><button onClick={this.doNotshowGame}>Hide Game </button><Game dataApi={this.state.dataApi} /></div>
      // : 
      // <button onClick={this.showGame}>Show Game</button>;

      button = showGame? 
      <div><Game dataApi={this.state.dataApi} /></div>
      : 
      <div>
          Username: <input type="text" placeholder="username" ref={(input) => {this.username = input}}></input><br/><br/>
          Password: <input type="password" placeholder="password" style={{marginLeft: .4 + 'em'}} ref={(input) => {this.password = input}}></input><br/><br/>
          <button onClick={(e) => this.login(this.loginSuccess,this.loginFail)} style={{marginLeft: 14 + 'em'}}>login</button>
      </div>;

      return(
          <div>
              {button}<br/><br/>
              {loginError}
          </div>
          
      );
  }
}


class Square extends React.Component {
  render() {
    if(this.props.id %6 === 0)
    {
      return (
        <div>
          <button className="square">  
            {this.props.gamename}
          </button>
        </div>
      )
    }
    else
    {
      return (
          <button className="square">
            {this.props.gamename}
          </button>
      )
    }
    
  }
}

class Game extends React.Component {
  render() {
    return (
      <div className="game">
        {/*<div className="game-board"> 
          <Board />
        </div>*/}
        <div className="game-info">
        <div><b>Codneames:</b></div>
          <div>{this.props.dataApi}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
    <Login />
     
  ,
  document.getElementById('root')
);
7