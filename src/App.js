import './App.css';
import { createDungeon } from './Dungeon';
import { typeMap, scale } from './Constants';

function App () {
  const dungeon = createDungeon();

  return (
    <div id="dungeon">
      {
        dungeon.map((col, colIdx) => {
          return (col.map((row, rowIdx) => {
            const styles = {
              top: `${rowIdx * scale}px`,
              left: `${colIdx * scale}px`,
              width: `${scale}px`,
              height: `${scale}px`
            };
            return (
              <div className={`cell ${typeMap[row.type]}`} style={styles} />
            )
          }))
        })
      }
    </div>
  );
}

export default App;
