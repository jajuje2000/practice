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
  