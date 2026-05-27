import { LAYOUT, tileToWorld } from '../data/layout'
import Tile from './Tile'

// Renders the full tile grid from the LAYOUT array.
// To change the grid shape, edit layout.js — this component never needs touching.
export default function Grid() {
  return (
    <group>
      {LAYOUT.flatMap((row, rowIdx) =>
        row.map((cell, colIdx) => {
          if (cell === 0) return null
          const [x, y, z] = tileToWorld(colIdx, rowIdx)
          return (
            <Tile
              key={`${colIdx}-${rowIdx}`}
              position={[x, y, z]}
            />
          )
        })
      )}
    </group>
  )
}
