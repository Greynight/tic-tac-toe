const CIRCLE = 'circle';
const CROSS = 'cross';
const LEFT = 'left';
const RIGHT = 'right';
const winCombinations = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['1', '4', '7'],
  ['2', '5', '8'],
  ['3', '6', '9'],
  ['1', '5', '9'],
  ['3', '5', '7']
];

class Cell extends React.Component {
  constructor(props) {
    super();
  }

  render() {
    const type = this.props.type;
    const cell = type === CROSS ? <Cross /> : type === CIRCLE ? <Circle /> : '';
    const isWinner = this.props.isWinner;
    let className = "";

    if (isWinner) {
      className="green-cell";
    }

    return (
      <div className={className}>
      {cell}
      </div>
  );
  }
}

class Cross extends React.Component {
  render() {
    return (<div className={CROSS}>x</div>);
  }
}

class Circle extends React.Component {
  render() {
    return (<div className={CIRCLE}></div>);
  }
}

class TurnCell extends React.Component {
  render() {
    const type = this.props.side === this.props.turn ? this.props.type : '';

    return <Cell type={type} />;
  }
}

class App extends React.Component {
  constructor(props) {
    super();

    this.mode = props.mode;
    this.turn = LEFT;

    this.state = {
      cells: {},
      currentType: props.figure,
      winners: {}
    };

    this.changeType = {
      [CROSS]: CIRCLE,
      [CIRCLE]: CROSS
    };

    this.changeTurn = {
      [LEFT]: RIGHT,
      [RIGHT]: LEFT
    };
  }

  onCellClick = (evt) => {
    if (!Object.keys(this.state.winners).length) {
      const cellId = evt.target.id;
      const cells = this.state.cells;
      const type = this.state.currentType;
      const newType = this.changeType[type];

      this.turn = this.changeTurn[this.turn];

      cells[cellId] = type;

      this.setState({
        cells,
        currentType: newType
      });

      let win = this.checkWinCombination(type);

      // game against AI
      if (!win && this.mode === 'single' && this.turn === RIGHT) {
        setTimeout(() => {
          this.aiStep(newType);
        }, 500)
      }

      if (Object.keys(cells).length === 9) {
        this.showGameOver();
      }
    }
  };

  showGameOver = () => {
    setTimeout(() => {
      alert("Game is over");

      ReactDOM.render(
      <GameSelect />,
        document.getElementById('root')
      );
    }, 100);
  };

  calculateNextCell = (type, enemyType) => {
    const enemySteps = this.getMovementsHistory(enemyType);
    const steps = this.getMovementsHistory(type);
    const cells = Object.keys(this.state.cells);
    let result = null;
    let results = [];
    let possibleSteps = [];

    // the first step
    if (!steps.length) {
      if (!cells.includes('5')) {
        possibleSteps.push(5);
      } else {
        possibleSteps.push(1);
      }

      // next steps
    } else {
      for (let combination of winCombinations) {
        // check if winning combination is possible
        let diff = _.difference(combination, steps);

        if (diff.length === 1 && !cells.includes(diff[0])) {
          result = diff[0];
          break;
        }

        // check if enemy's winning combination is possible
        let enemyDiff = _.difference(combination, enemySteps);

        if (enemyDiff.length === 1 && !cells.includes(enemyDiff[0])) {
          results.push(enemyDiff[0]);
        }

        // check the second cell in winning combination
        if (diff.length === 2) {
          if (!cells.includes(diff[0])) {
            possibleSteps.push(diff[0]);
          } else if (!cells.includes(diff[1])) {
            possibleSteps.push(diff[1]);
          }
        }
      }
    }

    if (!result) {
      result = results[0];
    }

    if (!result) {
      result = possibleSteps[0];
    }

    return result;
  };

  aiStep = (type) => {
    const cells = this.state.cells;
    const enemyType = this.changeType[type];
    const cellId = this.calculateNextCell(type, enemyType);

    cells[cellId] = type;

    this.turn = this.changeTurn[this.turn];

    this.setState({
      cells,
      currentType: enemyType
    });

    this.checkWinCombination(type);
  };

  getMovementsHistory = (type) => {
    const cells = this.state.cells;
    const keys = Object.keys(cells);
    let currentTypeCells = [];

    for (let key of keys) {
      if (cells[key] === type) {
        currentTypeCells.push(key);
      }
    }

    return currentTypeCells;
  };

  checkWinCombination = (type) => {
    let win = false;

    const currentTypeCells = this.getMovementsHistory(type);

    // we need at least 3 filled cells to win
    if (currentTypeCells.length > 2) {
      for (let combination of winCombinations) {
        if (!_.difference(combination, currentTypeCells).length) {
          this.showGameOver();

          win = true;
          let winners = {};

          for (let cellId of combination) {
            winners[cellId] = true;
          }

          this.setState({winners});
        }
      }
    }

    return win;
  };

  render() {
    return (
      <div className="container-fluid">
      <div className="row" style={{ height: 100 }}></div>
    <div className="row">
      <div className="col-3"></div>
      <div className="col-1 green-cell"><TurnCell turn={this.turn} side={LEFT} type={this.state.currentType} /></div>
    <div className="col-1"></div>
      <div className="col-2 content">
      <div className="row bottom-border" style={{ height: 100 }}>
  <div className="col-4 right-border" id="1" onClick={this.onCellClick}><Cell type={this.state.cells['1']} isWinner={this.state.winners['1']} /></div>
    <div className="col-4 right-border" id="2" onClick={this.onCellClick}><Cell type={this.state.cells['2']} isWinner={this.state.winners['2']} /></div>
    <div className="col-4" id="3" onClick={this.onCellClick}><Cell type={this.state.cells['3']} isWinner={this.state.winners['3']} /></div>
    </div>
    <div className="row bottom-border" style={{ height: 100 }}>
  <div className="col-4 right-border" id="4" onClick={this.onCellClick}><Cell type={this.state.cells['4']} isWinner={this.state.winners['4']} /></div>
    <div className="col-4 right-border" id="5" onClick={this.onCellClick}><Cell type={this.state.cells['5']} isWinner={this.state.winners['5']} /></div>
    <div className="col-4" id="6" onClick={this.onCellClick}><Cell type={this.state.cells['6']} isWinner={this.state.winners['6']} /></div>
    </div>
    <div className="row" style={{ height: 100 }}>
  <div className="col-4 right-border" id="7" onClick={this.onCellClick}><Cell type={this.state.cells['7']} isWinner={this.state.winners['7']} /></div>
    <div className="col-4 right-border" id="8" onClick={this.onCellClick}><Cell type={this.state.cells['8']} isWinner={this.state.winners['8']} /></div>
    <div className="col-4" id="9" onClick={this.onCellClick}><Cell type={this.state.cells['9']} isWinner={this.state.winners['9']} /></div>
    </div>
    </div>
    <div className="col-1"></div>
      <div className="col-1 green-cell"><TurnCell turn={this.turn} side={RIGHT} type={this.state.currentType} /></div>
    <div className="col-3"></div>
      </div>
      </div>
  );
  }
}

class GameSelect extends React.Component {
  constructor(props) {
    super();
  }

  onModeClick = (evt) => {
    const choise = evt.target.id;

    ReactDOM.render(
    <FigureSelect mode={choise} />,
      document.getElementById('root')
    );
  };

  render() {
    return (
      <div className="container-fluid">
      <div className="row" style={{ height: 100 }}></div>
    <div className="row justify-content-md-center" style={{ height: 100 }}>
  <div className="col-2 text-center">
      Please select game mode
    </div>
    </div>
    <div className="row justify-content-md-center">
      <div className="col-1 text-center right-border content" id="single" onClick={this.onModeClick}>SINGLE</div>
    <div className="col-1 text-center content" id="multi" onClick={this.onModeClick}>MULTIPLAYER</div>
    </div>
    </div>
  );
  }
}

class FigureSelect extends React.Component {
  constructor(props) {
    super();

    this.mode = props.mode;
  }

  onFigureClick = (evt) => {
    const choise = evt.target.className;

    if (choise === CROSS || choise === CIRCLE) {
      ReactDOM.render(
      <App mode={this.mode} figure={choise} />,
        document.getElementById('root')
    );
    }
  };

  render() {
    return (
      <div className="container-fluid">
      <div className="row" style={{ height: 100 }}></div>
    <div className="row justify-content-md-center" style={{ height: 100 }}>
  <div className="col-2 text-center">
      Please select your figure
    </div>
    </div>
    <div className="row justify-content-md-center">
      <div className="col-1 text-center right-border content" onClick={this.onFigureClick}><Circle /></div>
    <div className="col-1 text-center content" onClick={this.onFigureClick}><Cross /></div>
    </div>
    </div>
  );
  }
}

ReactDOM.render(
<GameSelect />,
  document.getElementById('root')
);
