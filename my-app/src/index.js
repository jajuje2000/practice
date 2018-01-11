import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

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

class AwsApiCalls extends React.Component{
  constructor(){
    super();
    this.state = {
      dataApi: [],
    };
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

  render(){
    return(
      <div>
        {this.state.dataApi}
      </div>
    )
  }

}

class Board extends React.Component {
  renderSquare(i) {
    return <Square />;
  }

  render() {
    const status = 'Next player: X';

    return (
      <div>
        <div className="status">{status}</div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
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
          <div><AwsApiCalls /></div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
