'use client';
import { useState, useEffect } from 'react';
import { useDataStore } from '@/lib/stores/useDataStore';
import { useParams } from 'next/navigation'; // ← CHANGED: useParams

export default function SubmissionsPage() {
  const params = useParams(); // ← NEW: useParams
  const projectId = params?.projectId as string; // ← NEW
  const datasetId = params?.datasetId as string; // ← NEW
  
  const { 
    submissions, 
    geoPoints, 
    geoPointsAvailable, 
    geoPointPath,
    fetchAllSubmissions,
    submissionsLoading 
  } = useDataStore();

  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  // Load data on mount
  useEffect(() => {
    if (projectId && datasetId) {
      fetchAllSubmissions(Number(projectId), datasetId);
    }
  }, [projectId, datasetId, fetchAllSubmissions]);



  if (!projectId || !datasetId) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Submissions</h1>
        <p className="text-red-500">Missing projectId or datasetId in URL</p>
        <p className="text-gray-500 mt-2">
          Use: <code>/submissions/[projectId]/[datasetId]</code>
        </p>
      </div>
    );
  }

  // ... REST OF YOUR CODE IS IDENTICAL ...
  if (submissionsLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Submissions ({submissions.length})</h1>
        <div className="flex gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            geoPointsAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {geoPointsAvailable ? '✅ GeoPoints' : '❌ No GeoPoints'}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            Project: {projectId}
          </span>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Total</h3>
          <p className="text-2xl font-bold text-blue-600">{submissions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">With GeoPoints</h3>
          <p className="text-2xl font-bold text-green-600">{geoPoints.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Form ID</h3>
          <p className="text-lg font-bold">{datasetId}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-700">Status</h3>
          <p className="text-lg font-bold text-green-600">All Approved</p>
        </div>
      </div>

      {/* SUBMISSIONS TABLE */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((submission, index) => (
              <tr 
                key={submission.__id || index}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedSubmission(submission)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {submission.__id?.slice(-8) || index + 1}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(submission.__system?.submissionDate || Date.now()).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    submission.__system?.reviewState === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {submission.__system?.reviewState || 'submitted'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(() => {
                    // DYNAMIC ACCESS: submission.G6.GPS → submission['G6']['GPS']
                    if (!geoPointPath) return <span className="text-gray-400">No GPS</span>;
                    
                    const pathParts = geoPointPath.replace('/', '').split('/');
                    let geoValue = submission;
                    for (const part of pathParts) {
                      geoValue = geoValue?.[part];
                    }
                    
                    const coords = geoValue?.coordinates;
                    if (!coords || !Array.isArray(coords)) return <span className="text-gray-400">No GPS</span>;
                    
                    return (
                      <div className="text-sm text-gray-900">
                        {coords[1].toFixed(4)},{' '}
                        <span className="font-medium">{coords[0].toFixed(4)}</span>
                      </div>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedSubmission(submission); }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAILED VIEW MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Submission Details</h2>
                <button 
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <pre className="text-sm overflow-auto bg-gray-50 p-4 rounded">
                {JSON.stringify(selectedSubmission, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
