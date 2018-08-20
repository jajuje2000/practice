import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Game extends React.Component {
    render() {
      return (
        <div className="game">
          {/* <div className="game-board"> 
            <Board />
          </div> */}
          <div className="game-info">
          <div><b>Codneames:</b></div>
            <div>{this.props.dataApi}</div>
            <ol>{/* TODO */}</ol>
          </div>
        </div>
      );
    }
  }