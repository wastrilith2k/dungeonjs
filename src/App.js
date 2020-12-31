import './App.css';
import { createDungeon } from './Dungeon';

const types = ['wall', 'corridor', 'room'];

function App () {
  const dungeon = createDungeon();

  return (
    <div id="dungeon">
      {
        dungeon.map((col, colIdx) => {
          return (col.map((row, rowIdx) => {
            const styles = {top: `${rowIdx * 5}px`, left: `${colIdx * 5}px`};
            return (
              <div className={`cell ${types[row.type]}`} style={styles} />
            )
          }))
        })
      }
    </div>
  );
}

export default App;
