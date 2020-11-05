import { DataTable } from '../../../models/metrics/data_table';

describe("DataTable", () => {

  describe("#setColumns", () => {
    it("sets the table columns", () => {
      const table = new DataTable();
      const cols = [{ label: "My Col", type: "number" }];

      table.setColumns(cols);
      
      expect(table.cols).toEqual(cols);
    })
  })

  describe("#addRow", () => {
    it("appends a table row", () => {
      const table = new DataTable();
      const row1 = [1, 2, 3];
      const row2 = [4, 5, 6];

      table.addRow(row1);
      table.addRow(row2);
      
      expect(table.rows).toEqual([row1, row2]);
    })
  })

  describe("#addRows", () => {
    it("appends rows to the table", () => {
      const table = new DataTable();
      const row1 = [1, 2, 3];
      const rows = [[4, 5, 6], [7, 8, 9]];

      table.addRow(row1);
      table.addRows(rows);
      
      expect(table.rows).toEqual([row1].concat(rows));
    })
  })

  describe('#build', () => {
    it("builds a Google Charts data table", () => {
      const table = new DataTable();
      table.setColumns([{ label: 'Foo', type: 'number' }])
      table.addRow([1])

      const result = table.build();

      expect(result).toEqual([
        [{ label: 'Foo', type: 'number' }],
        { c: [ { v: 1 } ] }
      ])
    })
  })
})
