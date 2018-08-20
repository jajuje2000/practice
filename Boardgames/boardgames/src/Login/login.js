import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

class Login extends React.Component {
    constructor(props)
    {
      super(props);
      this.loginFail = this.loginFail.bind(this);
      this.loginSuccess = this.loginSuccess.bind(this);
      this.state = { showGame: false, showLoginError: false, dataApi: [],userName: "", showRegisterComponent: false }
      
    }
  
    componentDidMount(){
      if(sessionStorage['AWSidToken'])
      {
        var https = require('https');
        var jose = require('node-jose');
  
        var region = 'us-east-2';
        var userpool_id = 'us-east-2_CHKFnQKV0';
        var app_client_id = '32qkjd6j36j7rh48c422ctjphl';
        var keys_url = 'https://cognito-idp.' + region + '.amazonaws.com/' + userpool_id + '/.well-known/jwks.json';
  
        var token = sessionStorage['AWSidToken'];
        var sections = token.split('.');
        // get the kid from the headers prior to verification
        var header = jose.util.base64url.decode(sections[0]);
        header = JSON.parse(header);
        var kid = header.kid;
  
      //download the public keys
      https.get(keys_url, response =>
      {
          if (response.statusCode === 200) 
          {
              response.on('data', body =>
              {
                  var keys = JSON.parse(body)['keys'];
                  // search for the kid in the downloaded public keys
                  var key_index = -1;
                  for (var i=0; i < keys.length; i++) {
                          if (kid === keys[i].kid) {
                              key_index = i;
                              break;
                          }
                  }
                  if (key_index === -1) {
                      console.log('Public key not found in jwks.json');
                      //callback('Public key not found in jwks.json');
                  }
                  // construct the public key
                  jose.JWK.asKey(keys[key_index])
                  .then(result =>
                  {
                      // verify the signature
                      jose.JWS.createVerify(result)
                      . verify(token)
                      .then(result => {
                          // now we can use the claims
                          var claims = JSON.parse(result.payload);
                          // additionally we can verify the token expiration
                          var current_ts = Math.floor(new Date() / 1000);
                          if (current_ts > claims.exp) {
                            this.removeSessionStorageId();
                            console.log('Token is expired');
                            return;
                              //callback('Token is expired');
                          }
                          // and the Audience
                          if (claims.aud !== app_client_id) {
                              this.removeSessionStorageId();
                              console.log('Token was not issued for this audience');
                              return;
                            // callback('Token was not issued for this audience');
                          }
                        this.setState({userName: claims['cognito:username']});
                        this.loginSuccess();
                        //callback(null, claims);
                      })
                      .catch(function() {
                          //callback('Signature verification failed');
                      });
                  });
              });
          }
      });
      }
    }
  
    removeSessionStorageId(){
      sessionStorage.removeItem("AWSidToken");
      
    }
  
    showRegisterComponent(){
      this.setState({ showGame: false, showLoginError: false, showRegisterComponent: true });
    }
  
    loginSuccess(){
      fetch('https://f0lotrvq43.execute-api.us-east-2.amazonaws.com/beta/tbgames',{   
        method: 'Get'
      })
      .then(results => {
        return results.json();
      }).then(data => {
        var details = data.Items[0].Details.M;
        var codenames = details.Codenames.SS;
        var ctr = codenames.length, temp, index;
  
        let dataApi = [];
        let j = 0;
        while(ctr > 0 && j < 25){
          j++;
          index = Math.floor(Math.random() * ctr);
          // Decrease ctr by 1
            ctr--;
          // And swap the last element with it
            temp = codenames[ctr];
            codenames[ctr] = codenames[index];
            codenames[index] = temp;
  
            dataApi.push(<Square gamename={temp} id={j} key={ctr} />);
        }
        this.setState({showGame: true , showLoginError: false, dataApi: dataApi});
        console.log("state", this.state.dataApi)
      })
      .catch(function(){
        console.log('fetch failed');
      });
    }
  
    loginFail(){
      this.setState({ showGame: false, showLoginError: true });
    }
  
    signOut(){
      this.removeSessionStorageId();
      this.setState({ showGame: false, showLoginError: false, dataApi: [], userName: "" });
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
      
        onSuccess: result => {
            console.log('access token + ' + result.getAccessToken().getJwtToken());
            this.setState({userName: result.accessToken.payload.username});
            sessionStorage['AWSidToken'] = result.getIdToken().getJwtToken();
            //sessionStorage['AWSrefreshToken'] = result.getRefreshToken().getJwtToken();
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
          cognitoUser.completeNewPasswordChallenge("Practice123!@#" , userAttributes, this); 
        }
  
      }); 
    }
  
    render(){
        const showGame = this.state.showGame;
        const showLoginError = this.state.showLoginError;
        const showRegisterComponent = this.state.showRegisterComponent;
  
        let mainComponent = null;
        let loginError = null;
  
        loginError = showLoginError?<div><label style={{color:'red'}}>Username/Password is incorrect</label></div>:<div></div>;
  
        if(showRegisterComponent)
          mainComponent = <Register />;
        else{
          mainComponent = showGame? 
          <div>
            <div style={{position:'absolute',right:5 + '%'}}>
                <div>
                  <a onClick={(e) => this.signOut()} style={{color:'-webkit-link',textDecoration:'underline',cursor:'pointer'}}>Sign Out</a>
                </div>
                <div>
                  Welcome: {this.state.userName}
                </div>
              </div>
            <div style={{position:'absolute',left:40 + '%'}}>
                <h2>GAMECENTER</h2>
            </div>
            <div style={{position: 'absolute',left:30 + '%',top:30 + '%'}}>
              <Game dataApi={this.state.dataApi} />
            </div>
          </div>
          : 
          <div>
              <div style={{position:'absolute',left:40 + '%'}}>
                <h2>GAMECENTER</h2>
              </div>
              <div style={{position:'absolute',left:40 + '%',top:30 + '%'}}>
                Username: <input type="text" placeholder="username" ref={(input) => {this.username = input}}></input><br/><br/>
                Password: <input type="password" placeholder="password" style={{marginLeft: .4 + 'em'}} ref={(input) => {this.password = input}}></input>
                <br/><a style={{color:'-webkit-link',textDecoration:'underline',cursor:'pointer'}} onClick={(e) => this.showRegisterComponent()}>register</a>
                <br/><br/>
                <button onClick={(e) => this.login(this.loginSuccess,this.loginFail)} style={{marginLeft: 14 + 'em'}}>login</button><br/>
                {loginError}
            </div>
          </div>
          ;
        }
  
        
  
        return(
            <div>
                {mainComponent}
            </div>
            
        );
    }
  }