import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const DataTable = ({
  columns = [],
  data = [],
  sortBy,
  sortOrder = 'asc',
  onSort,
  loading = false,
  emptyMessage = 'No records found.'
}) => {
  const handleSort = (key, sortable) => {
    if (!sortable || !onSort) return;
    if (sortBy === key) {
      onSort(key, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              {columns.map((col) => {
                const isCurrentSort = sortBy === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    onClick={() => handleSort(col.key, col.sortable)}
                    className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider ${
                      col.sortable
                        ? 'cursor-pointer hover:bg-slate-100 select-none transition-colors'
                        : ''
                    } ${col.className || ''}`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>{col.label}</span>
                      {col.sortable && (
                        <span className="text-slate-400">
                          {isCurrentSort ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="h-3.5 w-3.5 text-primary-600" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5 text-primary-600" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 hover:text-slate-600" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="text-sm text-slate-500">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-slate-500 font-medium"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 whitespace-nowrap text-slate-700 ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row) : (row[col.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
