import Table from "../models/table.js";

const initializeTables = async () => {
  const count = await Table.countDocuments();
  if (count > 0) return;

  const defaultTables = [

        { tableNumber: 1, capacity: 2, position: { x: 50, y: 50 } },
        { tableNumber: 2, capacity: 2, position: { x: 200, y: 50 } },
        { tableNumber: 3, capacity: 2, position: { x: 350, y: 50 } },
        { tableNumber: 4, capacity: 2, position: { x: 500, y: 50 } },
        
        // 3 seaters (4 tables)
        { tableNumber: 5, capacity: 3, position: { x: 50, y: 150 } },
        { tableNumber: 6, capacity: 3, position: { x: 200, y: 150 } },
        { tableNumber: 7, capacity: 3, position: { x: 350, y: 150 } },
        { tableNumber: 8, capacity: 3, position: { x: 500, y: 150 } },
        
        // 4 seaters (5 tables)
        { tableNumber: 9, capacity: 4, position: { x: 50, y: 250 } },
        { tableNumber: 10, capacity: 4, position: { x: 200, y: 250 } },
        { tableNumber: 11, capacity: 4, position: { x: 350, y: 250 } },
        { tableNumber: 12, capacity: 4, position: { x: 500, y: 250 } },
        { tableNumber: 13, capacity: 4, position: { x: 275, y: 350 } },
        
        // 5 seaters (5 tables)
        { tableNumber: 14, capacity: 5, position: { x: 50, y: 450 } },
        { tableNumber: 15, capacity: 5, position: { x: 200, y: 450 } },
        { tableNumber: 16, capacity: 5, position: { x: 350, y: 450 } },
        { tableNumber: 17, capacity: 5, position: { x: 500, y: 450 } },
        { tableNumber: 18, capacity: 5, position: { x: 125, y: 550 } },
        
        // 6 seaters (2 tables)
        { tableNumber: 19, capacity: 6, position: { x: 275, y: 550 } },
        { tableNumber: 20, capacity: 6, position: { x: 425, y: 550 } }
      ];
  await Table.insertMany(defaultTables);
  console.log("Default tables initialized");
};

export default initializeTables;
