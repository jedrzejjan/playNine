var possibleCombinationSum = function(arr, n) {
  if (arr.indexOf(n) >= 0) { return true; }
  if (arr[0] > n) { return false; }
  if (arr[arr.length - 1] > n) {
    arr.pop();
    return possibleCombinationSum(arr, n);
  }
  var listSize = arr.length, combinationsCount = (1 << listSize)
  for (var i = 1; i < combinationsCount ; i++ ) {
    var combinationSum = 0;
    for (var j=0 ; j < listSize ; j++) {
      if (i & (1 << j)) { combinationSum += arr[j]; }
    }
    if (n === combinationSum) { return true; }
  }
  return false;
};

const Stars = (props) => {
  let stars = [];
  for (let i=0; i<(props.nrOfStars); i++){
    stars.push(<i key={i} className="fa fa-star"></i>)
  }
  return (
    <div className="col-5">
      {stars}
    </div>
  )
}
const Button = (props) => {
  let button;
  switch (props.answerIsCorrect) {
    case true:
      button = 
        <button className="btn btn-success"
          onClick={props.acceptAnswer}>
          <i className="fa fa-check"></i>
        </button>;
      break;
    case false:
      button = 
        <button className="btn btn-danger"
          onClick={props.acceptAnswer}>
          <i className="fa fa-times"></i>
        </button>;
      break;
    default:
      button = 
        <button className="btn" 
          onClick={props.checkAnswer}
          disabled={props.selectedNumbers.length === 0}>=</button>
      break;
    }
  return (
    <div className="col-2 text-center">
      {button}
      <br></br>
      <br></br>
      <button className="btn btn-warning btn-sm"
        onClick={props.redraw}
        disabled={props.nrOfRedraws===0 || props.timeIsOver}>
        <i className="fa fa-registered"> {props.nrOfRedraws}</i>
      </button>
    </div>
  )
}
const Answer = (props) => {
  return (
    <div className="col-5">
      {props.selectedNumbers.map(number => 
        <span onClick={() => props.unselectNumber(number)}>{number}</span>
      )}
    </div>
  )
}

const Numbers = (props) => {

  const isSelectedOrUsedNumber = (number) => {
    if (props.selectedNumbers.indexOf(number) >= 0){
      return "selected"
    }
    if (props.usedNumbers.indexOf(number) >= 0){
      return "used"
    }
  }
  // onClick need the function reference, not the function call, so i can't simply do onClick=props.selectNumber(number), but I have to make the reference to some other function. Still simply I'm doing onClick={() => props.selectNumber(number)}
  return(
    <div className="card text-center">
      <div>
        {Numbers.list.map((number, i) =>
          <span 
          className={isSelectedOrUsedNumber(number)} 
          onClick={() => props.selectNumber(number)} 
          key={i}>
            {number}
          </span>
        )}
      </div>
    </div>
  )
}
Numbers.list =  _.range(1,10);

const DoneFrame = (props) => {
  return(
    <div className="text-center">
      <h2>{props.doneStatus}</h2>
      <button className="btn btn-secondary" onClick={props.startAgain}>Start Again</button>
    </div>
  )
}

class Timer extends React.Component {
  
  constructor(props){
    super(props);
    this.state = {
      seconds : 45,
    }
  }
  
    tick() {
      if(this.state.seconds === 0){
        this.componentWillUnmount();
        return;
      }
      this.setState(prevState => ({
        seconds: prevState.seconds - 1,
      }));
    }

    componentDidMount() {
      this.interval = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
      clearInterval(this.interval);
      this.props.timeStatus();
    }
  
  render() {
    const divStyle = {
      margin: '10px',
      width: '130px',
      color: "brown",
      fontWeight: 'bold',
      display: 'inline-block',
      backgroundColor:'lightblue',
      alignItems: 'center',
      borderRadius: '10%',
  };
    return (
      <div className="text-center" style={divStyle}>
        Time left : {this.state.seconds}
      </div>
    );
    }
  }

class Game extends React.Component {  
  static randomNum = () => 1+Math.floor(Math.random()*9);
  static initialState = () => ({
    selectedNumbers: [],
    nrOfStars: Game.randomNum(),
    usedNumbers: [],
    answerIsCorrect: null,
    nrOfRedraws: 5,
    doneStatus: null,
    timeIsOver: false,
  });
  
  state = Game.initialState();
  
  selectNumber = (clickedNumber) => {
    if(this.state.selectedNumbers.indexOf(clickedNumber)>=0){return;}
    if(this.state.usedNumbers.indexOf(clickedNumber)>=0){return;}
    this.setState(prevState => ({
      selectedNumbers: prevState.selectedNumbers.concat(clickedNumber),
      answerIsCorrect: null,
    }));
  };
  
  unselectNumber = (clickedNumber) => {
    this.setState(prevState => ({
      selectedNumbers: prevState.selectedNumbers.filter(number => number!==clickedNumber),
      answerIsCorrect: null,
    }));
  };
  
  checkAnswer = () => {
    this.setState(prevState => ({
      answerIsCorrect: prevState.nrOfStars === prevState.selectedNumbers.reduce((acc, n) => acc + n, 0),
    }));
  };
  
  acceptAnswer = () => {
    if (this.state.answerIsCorrect === true) {
      this.setState(prevState => ({
        selectedNumbers: [],
        nrOfStars: Game.randomNum(),
        usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
        answerIsCorrect: null,
      }), this.updateDoneStatus);
    };
  };
  
  redraw = () => {
    if(this.state.nrOfRedraws === 0){return;}
    this.setState(prevState => ({
      selectedNumbers: [],
      answerIsCorrect: null,
      nrOfStars: Game.randomNum(),
      nrOfRedraws: prevState.nrOfRedraws - 1,
    }), this.updateDoneStatus);
  };
  
  //poniewaz przekazany zostal prevState,ktory jest obiektem, mozemy z niego wyciagnac co chcemy juz przy podawaniu parametrow 
  possibleSolutions = ({nrOfStars, usedNumbers}) => {
    const numbersLeft = _.range(1,10).filter(num => 
      usedNumbers.indexOf(num) === -1
    );
    return possibleCombinationSum(numbersLeft, nrOfStars);    
  }
  
  updateDoneStatus = () => {
    this.setState(prevState => {
      if (prevState.usedNumbers.length === 9) {
        return {doneStatus: 'Winner winner! :>'}
      }
      if ((this.state.timeIsOver === true) || (prevState.nrOfRedraws===0 && !this.possibleSolutions(prevState))){
        return {doneStatus: 'Game Over :<'}
      }
    })
  }
  
  startAgain = () => {
    this.setState(Game.initialState());
  }
  
  timeStatus = () => {
    this.setState(prevState => ({
      timeIsOver: true,
    }), this.updateDoneStatus);
  };
  
  render() {
    const {
      nrOfStars, 
      selectedNumbers, 
      answerIsCorrect,
      usedNumbers,
      nrOfRedraws,
      doneStatus,
      timeIsOver,
    } = this.state;
    return(
      <div className="container">
        <h3>Play nine</h3>
        <hr />
        <div className="row">
          <Stars nrOfStars={nrOfStars}></Stars>
          <Button selectedNumbers = {selectedNumbers}
            checkAnswer = {this.checkAnswer}
            answerIsCorrect = {answerIsCorrect}
            acceptAnswer = {this.acceptAnswer}
            redraw = {this.redraw}
            nrOfRedraws = {nrOfRedraws}
            timeIsOver = {timeIsOver}></Button>
          <Answer 
          selectedNumbers = {selectedNumbers}
          unselectNumber = {this.unselectNumber}></Answer>
        </div>
        <br />
        { doneStatus ? 
        <DoneFrame doneStatus={doneStatus}
          startAgain={this.startAgain}>
        </DoneFrame> :
        <div className="text-center">
          <Numbers 
          selectedNumbers = {selectedNumbers} 
          selectNumber = {this.selectNumber}
          usedNumbers = {usedNumbers}></Numbers>
          <Timer timeStatus = {this.timeStatus}></Timer>
        </div>
        }       
      </div>
    )
  }
}

class App extends React.Component {
  render() {
    return(
      <div>
        <Game/>
      </div>
    )
  }
}

ReactDOM.render(<App />, mountNode);