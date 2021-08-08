import { useEffect, useReducer, useState } from "react";
import "./styles.css";
import styled from "styled-components";

document.body.style.background = "#1f1b18";

function countAll(state) {
  var countBomb = 0;
  var countRemining = 0;
  for (var i = 0; i < state.game.row; i++) {
    for (var j = 0; j < state.game.column; j++) {
      if (state.matrix[i][j].isBomb) {
        countBomb += 1;
        continue;
      }
      if (state.matrix[i][j].isDisabled) {
        countRemining += 1;
      }
    }
  }
  return {
    countBomb,
    countRemining
  };
}
function countMines(state, i, j) {
  var rows = state.game.row;
  var columns = state.game.column;
  var count = 0;

  for (var k = 0; k < state.I.length; k++) {
    var newI = i + state.I[k];
    var newJ = j + state.J[k];

    if (newI < 0 || newI >= rows) {
      continue;
    }

    if (newJ < 0 || newJ >= columns) {
      continue;
    }

    if (state.matrix[newI][newJ].isBomb) {
      count++;
    }
  }
  return count;
}

function echo(state, dispatch, i, j) {
  if (state.matrix[i][j].isDisabled === true) return;

  var mineCount = countMines(state, i, j);

  state.matrix[i][j].isDisabled = true;
  dispatch({ type: "disableElement", value: { i, j } });
  if (mineCount !== 0) {
    //dispatch
    state.matrix[i][j].text = mineCount;
    dispatch({ type: "activeNumber", value: { mineCount, i, j } });
  } else {
    var rows = state.game.row;
    var columns = state.game.column;

    for (var k = 0; k < state.I.length; k++) {
      var newI = i + state.I[k];
      var newJ = j + state.J[k];

      if (newI < 0 || newI >= rows) {
        continue;
      }

      if (newJ < 0 || newJ >= columns) {
        continue;
      }
      echo(state, dispatch, newI, newJ);
    }
  }
}

function MinesweeperBlock() {}

function matrixReducer(state, action) {
  switch (action.type) {
    case "start":
      var matrix = [];
      for (var i = 0; i < state.game.row; i++) {
        matrix[i] = [];
        for (var j = 0; j < state.game.column; j++) {
          matrix[i][j] = { isDisabled: false, isBomb: false, value: undefined };
        }
      }
      return {
        ...state,
        matrix
      };
    case "calculateBombs":
      var numberOfBombs = Math.floor((state.game.row * state.game.column) / 6);
      return {
        ...state,
        numberOfBombs
      };
    case "addBombs":
      var matrix = state.matrix;
      var n = state.numberOfBombs;

      var count = 0;
      while (count < n) {
        let i = Math.floor(Math.random() * state.game.row);
        let j = Math.floor(Math.random() * state.game.column);

        if (matrix[i][j].isBomb) continue;

        matrix[i][j].isBomb = true;
        count++;
      }
      return {
        ...state,
        matrix
      };
    case "changeRender":
      return {
        ...state,
        render: !state.render
      };
    case "activeNumber":
      var matrix = state.matrix;
      matrix[action.value.i][action.value.j].value = action.value.mineCount;
      return {
        ...state,
        matrix
      };
    case "disableElement":
      var matrix = state.matrix;
      matrix[action.value.i][action.value.j].isDisabled = true;
      return {
        ...state,
        matrix
      };
    default:
      return state;
  }
}

function MinesweeperGame({ gameDispatch, game }) {
  const [matrix, dispatch] = useReducer(matrixReducer, {
    render: false,
    game: game,
    I: [-1, -1, 0, 1, 1, 1, 0, -1],
    J: [0, 1, 1, 1, 0, -1, -1, -1]
  });

  useEffect(() => {
    dispatch({ type: "start" });
    dispatch({ type: "calculateBombs" });
    dispatch({ type: "addBombs" });
    dispatch({ type: "changeRender" });
  }, []);

  function clickHandlerBox(i, j) {
    if (game.gameStopped) return;
    if (matrix.matrix[i][j].isBomb) {
      var allBombs = document.querySelectorAll("#bomb");
      allBombs.forEach((btnEl) => {
        btnEl.style.background = "black";
      });

      gameDispatch({ type: "resetGame" });
      return;
    }
    echo(matrix, dispatch, i, j);
    var blocks = countAll(matrix);
    console.log(blocks);
    if (game.row * game.column - blocks.countBomb === blocks.countRemining) {
      gameDispatch({ type: "gameWon" });
      return;
    }
  }
  const renderElements = () => {
    let widthScreen = window.innerWidth * 0.75; //remove 20% from the margin
    let widthBox = widthScreen / game.column;
    widthBox = widthBox * 0.84; //remove margins from box
    widthBox = (window.innerWidth * 0.75) / widthBox / 1.8; //transform from pixel to width
    let margin = widthBox * 0.08;
    let boxShadow = widthBox * 0.055;
    let fontSize = widthBox / 2;

    let unit = "vw";

    return (
      <div>
        {matrix.matrix.map((row, i) => (
          <div key={i}>
            {row.map((col, j) => (
              <Block
                id={`${col.isBomb ? "bomb" : ""}`}
                className={`no-${col.value !== undefined ? col.value : ""} ${
                  col.isDisabled ? "disabled" : ""
                }`}
                onClick={() => clickHandlerBox(i, j)}
                style={{
                  height: widthBox + unit,
                  width: widthBox + unit,
                  margin: margin + unit,
                  fontSize: fontSize + unit,
                  boxShadow: `${boxShadow}px ${boxShadow}px ${2 * boxShadow}px `
                }}
                key={j}
              >
                <BlockText>{col.value}</BlockText>
              </Block>
            ))}
          </div>
        ))}
      </div>
    );
  };
  return <>{matrix.render && renderElements()}</>;
}
function reducerHandler(state, action) {
  switch (action.type) {
    case "start":
      return {
        ...state,
        hasStarted: true
      };
    case "resetGame":
      return {
        ...state,
        hasStarted: true,
        gameStopped: true
      };
    case "reset":
      return {
        ...state,
        hasStarted: true,
        gameStopped: false
      };
    case "gameWon":
      return {
        ...state,
        hasStarted: true,
        gameStopped: true,
        hasWon: true
      };
    default:
      return state;
  }
}

function Minesweeper() {
  const [restart, setRestart] = useState(false);

  const [game, dispatch] = useReducer(reducerHandler, {
    row: 6,
    column: 10,
    gameStopped: false,
    hasStarted: false,
    hasWon: false
  });
  useEffect(() => {
    if (restart === true) {
      dispatch({ type: "reset" });
      setRestart(false);
    }
  }, [restart]);
  if (restart === true) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Game>
        {!game.hasStarted && !game.gameStopped && (
          <>
            <ButtonPlay onClick={() => dispatch({ type: "start" })}>
              Start Game
            </ButtonPlay>
            <p style={{ color: "white", fontSize: "2em" }}>
              For a better Experience use Landscape Mode
            </p>
          </>
        )}
        {game.hasStarted && (
          <MinesweeperGame game={game} gameDispatch={dispatch} />
        )}
        {game.gameStopped && (
          <Modal className={`${game.hasWon === true ? "gameWon" : "gameLost"}`}>
            {!game.hasWon && <p>YOU LOST :(</p>}
            {game.hasWon && <p>YOU WON :)</p>}
            <button onClick={() => setRestart(true)}>Play again</button>
          </Modal>
        )}
      </Game>
    </>
  );
}

export default function App() {
  return <Minesweeper />;
}
const ButtonPlay = styled.button`
  font-size: 3em;
`;
const Block = styled.div`
  border-radius: 23%;
  background: linear-gradient(145deg, #171412, #27221e);
  box-shadow: inset 9.01px 9.01px 15px #151311,
    inset -9.01px -9.01px 15px #29231f;

  display: inline-block;
  position: relative;
  transition: 0.2s;
  font-weight: 900;
  font-size: 1.2em;
  &.disabled {
    background: linear-gradient(145deg, #ff8952, #a75332);
    box-shadow: 6.31px 6.31px 13px #c8633b, -6.31px -6.31px 13px #f47949;
  }
  &#bomb {
    /* background: yellow; */
    /* background: #de1a1a !important; */
  }
`;
const BlockText = styled.span`
  position: absolute;
  color: white;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
`;
const Game = styled.div`
  min-width: 320px;
  position: relative;
  width: 80%;
  margin: 0 auto;
  height: 100%;
`;
const Modal = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  border-radius: 20px;
  color: white;
  text-transform: uppercase;
  font-weight: 900;
  font-family: sans-serif;
  letter-spacing: 2px;
  font-size: 2.5em;
  text-align: center;
  &.gameWon {
    background: green;
  }
  &.gameLost {
    background: #de1a1a;
  }
`;
