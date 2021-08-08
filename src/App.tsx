import { useEffect, useReducer, useState } from "react";
import "./styles.css";
import styled from "styled-components";

const Game = styled.div`
  position: relative;
  min-height: 100vh;
`;
const Modal = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #de1a1a;
  padding: 40px;
  border-radius: 20px;
  color: white;
  text-transform: uppercase;
  font-weight: 900;
  font-family: sans-serif;
  letter-spacing: 2px;
  font-size: 1.5em;
`;

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
const Block = styled.div`
  border-radius: 50px;
  background: linear-gradient(145deg, #f8fbff, #d1d4de);
  box-shadow: 20px 20px 60px #acaeb7, -20px -20px 60px #ffffff;
  width: 30px;
  height: 30px;
  border: 1px solid white;
  display: inline-block;
  position: relative;
  &.disabled {
    background: #acbed8;
  }
  &#bomb {
    background: linear-gradient(145deg, #f8fbff, #d1d4de);
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

function MinesweeperBlock() {}

function matrixReducer(state, action) {
  switch (action.type) {
    case "start":
      var matrix = [];
      for (var i = 0; i < state.game.column; i++) {
        matrix[i] = [];
        for (var j = 0; j < state.game.row; j++) {
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
        var i = Math.floor(Math.random() * state.game.row);
        var j = Math.floor(Math.random() * state.game.column);

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
      console.log(action.value);
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
    if (matrix.matrix[i][j].isBomb) {
      console.log("you lost");

      var allBombs = document.querySelectorAll("#bomb");
      allBombs.forEach((btnEl) => {
        btnEl.style.background = "black";
      });

      gameDispatch({ type: "resetGame" });
      return;
    }
    echo(matrix, dispatch, i, j);
  }
  const renderElements = () => {
    return (
      <div>
        {matrix.matrix.map((row, i) => (
          <div key={i}>
            {row.map((col, j) => (
              <Block
                id={`${col.isBomb ? "bomb" : ""}`}
                className={`${col.isDisabled ? "disabled" : ""}`}
                onClick={() => clickHandlerBox(i, j)}
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
  console.log(matrix);
  return <>{matrix.render && renderElements()}</>;
}
function reducerHandler(state, action) {
  switch (action.type) {
    case "start":
      console.log("Start the game");
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
    default:
      return state;
  }
}

function Minesweeper() {
  const [restart, setRestart] = useState(false);
  const [game, dispatch] = useReducer(reducerHandler, {
    row: 20,
    column: 20,
    gameStopped: false,
    hasStarted: false
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
    <Game>
      {!game.hasStarted && !game.gameStopped && (
        <button onClick={() => dispatch({ type: "start" })}>Start Game</button>
      )}
      {game.hasStarted && (
        <MinesweeperGame game={game} gameDispatch={dispatch} />
      )}
      {game.gameStopped && (
        <Modal>
          <p>You've Lost!</p>
          <button onClick={() => setRestart(true)}>Play again</button>
        </Modal>
      )}
    </Game>
  );
}

export default function App() {
  return <Minesweeper />;
}
