import "./App.css";
import { createDungeon } from "./Dungeon";
import { typeMap, scale, colors, types } from "./Constants";
function App() {
  const dungeon = createDungeon();

  const validTypes = [types.CORRIDOR, types.ROOM];

  return (
    <div id="dungeon">
      {dungeon.map((col, colIdx) => {
        return col.map((row, rowIdx) => {
          const styles = {
            top: `${rowIdx * scale}px`,
            left: `${colIdx * scale}px`,
            width: `${scale}px`,
            height: `${scale}px`,
          };
          if (validTypes.includes(row.type))
            styles.backgroundColor = colors[row.regionIdx];
          return (
            <div
              className={`cell ${typeMap[row.type]}`}
              style={styles}
              key={`cell-${colIdx}-${rowIdx}`}
            />
          );
        });
      })}
    </div>
  );
}

export default App;
