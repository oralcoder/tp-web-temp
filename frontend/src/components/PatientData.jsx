import { useState } from 'react';

const PatientData = () => {
  // 샘플 데이터
  const oralPhotos = [
    { id: 1, type: 'image', url: '/path/to/oral1.jpg', hasImage: true },
    { id: 2, type: 'image', url: '', hasImage: false },
    { id: 3, type: 'image', url: '', hasImage: false },
    { id: 4, type: 'image', url: '', hasImage: false },
    { id: 5, type: 'image', url: '', hasImage: false },
  ];

  const xrayImages = [
    { id: 1, type: 'xray', url: '/path/to/xray1.jpg', hasImage: true },
    { id: 2, type: 'xray', url: '', hasImage: false },
    { id: 3, type: 'xray', url: '', hasImage: false },
    { id: 4, type: 'xray', url: '', hasImage: false },
    { id: 5, type: 'xray', url: '', hasImage: false },
  ];

  const stlFiles = [
    { id: 1, type: 'stl', url: '/path/to/stl1.stl', hasImage: true },
    { id: 2, type: 'stl', url: '', hasImage: false },
    { id: 3, type: 'stl', url: '', hasImage: false },
    { id: 4, type: 'stl', url: '', hasImage: false },
    { id: 5, type: 'stl', url: '', hasImage: false },
  ];

  const otherFiles = [
    { id: 1, type: 'other', url: '', hasImage: false },
    { id: 2, type: 'other', url: '', hasImage: false },
    { id: 3, type: 'other', url: '', hasImage: false },
    { id: 4, type: 'other', url: '', hasImage: false },
    { id: 5, type: 'other', url: '', hasImage: false },
  ];

  const handleBulkDownload = () => {
    alert('일괄 다운로드 기능 (준비 중)');
  };

  // 플레이스홀더 렌더링
  const renderPlaceholder = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
      </svg>
    </div>
  );

  // 치아 아이콘 렌더링
  const renderToothIcon = () => (
    <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C10.5 2 9 2.5 8 3.5C7 4.5 6 6 6 8C6 10 6 12 6 14C6 16 6.5 18 7 19.5C7.5 21 8.5 22 10 22C11 22 11.5 21.5 12 20.5C12.5 21.5 13 22 14 22C15.5 22 16.5 21 17 19.5C17.5 18 18 16 18 14C18 12 18 10 18 8C18 6 17 4.5 16 3.5C15 2.5 13.5 2 12 2Z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">환자데이터</h1>
          <button
            onClick={handleBulkDownload}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            일괄 다운로드
          </button>
        </div>

        {/* 구강 내 사진 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">구강 내 사진</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-5 gap-4">
              {oralPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-blue-500 transition-colors"
                >
                  {photo.hasImage ? (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">이미지 {photo.id}</span>
                    </div>
                  ) : (
                    renderToothIcon()
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* X-Ray */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">X-Ray</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-5 gap-4">
              {xrayImages.map((xray) => (
                <div
                  key={xray.id}
                  className="aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-blue-500 transition-colors"
                >
                  {xray.hasImage ? (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">X-Ray {xray.id}</span>
                    </div>
                  ) : (
                    renderToothIcon()
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STL */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">STL</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-5 gap-4">
              {stlFiles.map((stl) => (
                <div
                  key={stl.id}
                  className="aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-blue-500 transition-colors"
                >
                  {stl.hasImage ? (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">STL {stl.id}</span>
                    </div>
                  ) : (
                    renderToothIcon()
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 기타 */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">기타</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-5 gap-4">
              {otherFiles.map((file) => (
                <div
                  key={file.id}
                  className="aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-blue-500 transition-colors"
                >
                  {renderToothIcon()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientData;
