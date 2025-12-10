import { useState, useRef, useEffect } from 'react';

const DicomViewer = ({ patient, onClose }) => {
  const canvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingTool, setDrawingTool] = useState('pen'); // 'pen', 'line', 'circle', 'rectangle', 'select'
  const [drawingColor, setDrawingColor] = useState('#FF0000');
  const [lineWidth, setLineWidth] = useState(2);
  const [showDrawing, setShowDrawing] = useState(true);
  const [drawings, setDrawings] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [selectedDrawingIndex, setSelectedDrawingIndex] = useState(null);
  const [hoveredDrawingIndex, setHoveredDrawingIndex] = useState(null);

  // DICOM 이미지 로드 (시뮬레이션)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // CT 이미지 시뮬레이션 - 실제로는 DICOM 파일을 렌더링해야 하지만
    // 여기서는 간단한 그레이스케일 원형 패턴으로 시뮬레이션
    canvas.width = 730;
    canvas.height = 556;
    
    // 검은 배경
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 730, 556);
    
    // CT 스캔 시뮬레이션 (타원형 구조)
    const centerX = 365;
    const centerY = 278;
    
    // 외부 타원 (두개골 외곽)
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 280, 240, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#2a2a2a';
    ctx.fill();
    
    // 내부 구조 (치아 구조 시뮬레이션)
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 200, 180, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();
    
    // 치아 영역 (밝은 부분)
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 / 20) * i;
      const x = centerX + Math.cos(angle) * 160;
      const y = centerY + Math.sin(angle) * 140;
      
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#b0b0b0';
      ctx.fill();
    }
    
    // 중앙 어두운 영역
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 120, 100, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a0a0a';
    ctx.fill();
    
    // 노이즈 효과 추가 (CT 스캔 느낌)
    const imageData = ctx.getImageData(0, 0, 730, 556);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 20 - 10;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);
    
    // 정보 텍스트
    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.fillText('CT SCAN - Axial View', 10, 20);
    ctx.fillText(`Patient: ${patient.patientName}`, 10, 40);
    ctx.fillText('W: 400 L: 40', 10, 536);
    ctx.fillText('Slice: 1/1', 650, 536);
  }, [patient]);

  // 드로잉 캔버스 초기화
  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    
    canvas.width = 730;
    canvas.height = 556;
  }, []);

  // 저장된 드로잉 복원
  useEffect(() => {
    if (!showDrawing) return;
    redrawAll();
  }, [drawings, showDrawing]);

  const redrawAll = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!showDrawing) return;

    drawings.forEach((drawing, index) => {
      // 선택되거나 호버된 드로잉 강조
      const isSelected = index === selectedDrawingIndex;
      const isHovered = index === hoveredDrawingIndex;
      
      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = drawing.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'source-over';

      // 강조 효과
      if (isSelected || isHovered) {
        ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
        ctx.shadowBlur = 10;
      }

      if (drawing.tool === 'pen') {
        ctx.beginPath();
        drawing.path.forEach((point, i) => {
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      } else if (drawing.tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(drawing.startX, drawing.startY);
        ctx.lineTo(drawing.endX, drawing.endY);
        ctx.stroke();
      } else if (drawing.tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(drawing.endX - drawing.startX, 2) + 
          Math.pow(drawing.endY - drawing.startY, 2)
        );
        ctx.beginPath();
        ctx.arc(drawing.startX, drawing.startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (drawing.tool === 'rectangle') {
        ctx.beginPath();
        ctx.rect(
          drawing.startX, 
          drawing.startY, 
          drawing.endX - drawing.startX, 
          drawing.endY - drawing.startY
        );
        ctx.stroke();
      }

      // 그림자 효과 제거
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    });
  };

  const getMousePos = (e) => {
    const canvas = drawingCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (drawingTool === 'select') {
      // 선택 모드: 클릭한 위치의 드로잉 찾기
      const pos = getMousePos(e);
      const clickedIndex = findDrawingAtPoint(pos.x, pos.y);
      setSelectedDrawingIndex(clickedIndex);
      return;
    }

    setIsDrawing(true);
    const pos = getMousePos(e);
    
    if (drawingTool === 'pen') {
      setCurrentPath([pos]);
    } else {
      setCurrentPath([{ startX: pos.x, startY: pos.y }]);
    }
  };

  const findDrawingAtPoint = (x, y) => {
    // 역순으로 검색 (최근 드로잉이 위에 있으므로)
    for (let i = drawings.length - 1; i >= 0; i--) {
      const drawing = drawings[i];
      const tolerance = drawing.lineWidth + 5;

      if (drawing.tool === 'pen') {
        // 펜 드로잉: 경로상의 점들과의 거리 확인
        for (let point of drawing.path) {
          const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
          if (distance <= tolerance) {
            return i;
          }
        }
      } else if (drawing.tool === 'line') {
        // 직선: 점과 선분 사이의 거리 계산
        const distance = pointToLineDistance(x, y, drawing.startX, drawing.startY, drawing.endX, drawing.endY);
        if (distance <= tolerance) {
          return i;
        }
      } else if (drawing.tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(drawing.endX - drawing.startX, 2) + 
          Math.pow(drawing.endY - drawing.startY, 2)
        );
        const distance = Math.sqrt(
          Math.pow(x - drawing.startX, 2) + 
          Math.pow(y - drawing.startY, 2)
        );
        if (Math.abs(distance - radius) <= tolerance) {
          return i;
        }
      } else if (drawing.tool === 'rectangle') {
        // 사각형: 테두리 근처인지 확인
        const minX = Math.min(drawing.startX, drawing.endX);
        const maxX = Math.max(drawing.startX, drawing.endX);
        const minY = Math.min(drawing.startY, drawing.endY);
        const maxY = Math.max(drawing.startY, drawing.endY);
        
        if (
          (Math.abs(x - minX) <= tolerance || Math.abs(x - maxX) <= tolerance) &&
          y >= minY - tolerance && y <= maxY + tolerance
        ) {
          return i;
        }
        if (
          (Math.abs(y - minY) <= tolerance || Math.abs(y - maxY) <= tolerance) &&
          x >= minX - tolerance && x <= maxX + tolerance
        ) {
          return i;
        }
      }
    }
    return null;
  };

  const pointToLineDistance = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const draw = (e) => {
    if (drawingTool === 'select') {
      // 선택 모드에서는 호버 감지
      const pos = getMousePos(e);
      const hoverIndex = findDrawingAtPoint(pos.x, pos.y);
      setHoveredDrawingIndex(hoverIndex);
      return;
    }

    if (!isDrawing) return;
    
    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getMousePos(e);

    if (drawingTool === 'pen') {
      setCurrentPath(prev => [...prev, pos]);
      
      // 실시간 그리기
      ctx.strokeStyle = drawingColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      if (currentPath.length > 0) {
        const lastPoint = currentPath[currentPath.length - 1];
        ctx.moveTo(lastPoint.x, lastPoint.y);
      }
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      // 도형은 실시간 프리뷰
      redrawAll();
      
      ctx.strokeStyle = drawingColor;
      ctx.lineWidth = lineWidth;
      
      const start = currentPath[0];
      
      if (drawingTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(start.startX, start.startY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (drawingTool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(pos.x - start.startX, 2) + 
          Math.pow(pos.y - start.startY, 2)
        );
        ctx.beginPath();
        ctx.arc(start.startX, start.startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (drawingTool === 'rectangle') {
        ctx.beginPath();
        ctx.rect(
          start.startX, 
          start.startY, 
          pos.x - start.startX, 
          pos.y - start.startY
        );
        ctx.stroke();
      }
    }
  };

  const stopDrawing = (e) => {
    if (drawingTool === 'select' || !isDrawing) {
      setIsDrawing(false);
      return;
    }
    
    setIsDrawing(false);
    
    const pos = getMousePos(e);
    
    let newDrawing;
    if (drawingTool === 'pen') {
      newDrawing = {
        tool: drawingTool,
        color: drawingColor,
        lineWidth: lineWidth,
        path: [...currentPath, pos]
      };
    } else {
      const start = currentPath[0];
      newDrawing = {
        tool: drawingTool,
        color: drawingColor,
        lineWidth: lineWidth,
        startX: start.startX,
        startY: start.startY,
        endX: pos.x,
        endY: pos.y
      };
    }
    
    const updatedDrawings = [...drawings, newDrawing];
    setDrawings(updatedDrawings);
    setCurrentPath([]);
    
    // 로컬 스토리지에 저장
    saveDrawings(updatedDrawings);
  };

  const saveDrawings = (drawingsToSave) => {
    const savedDrawings = JSON.parse(localStorage.getItem('dicomDrawings') || '{}');
    savedDrawings[patient.patientName] = drawingsToSave;
    localStorage.setItem('dicomDrawings', JSON.stringify(savedDrawings));
  };

  const deleteSelectedDrawing = () => {
    if (selectedDrawingIndex === null) return;
    
    const updatedDrawings = drawings.filter((_, index) => index !== selectedDrawingIndex);
    setDrawings(updatedDrawings);
    setSelectedDrawingIndex(null);
    
    // 로컬 스토리지 업데이트
    saveDrawings(updatedDrawings);
  };

  // 컴포넌트 마운트 시 저장된 드로잉 로드
  useEffect(() => {
    const savedDrawings = JSON.parse(localStorage.getItem('dicomDrawings') || '{}');
    if (savedDrawings[patient.patientName]) {
      setDrawings(savedDrawings[patient.patientName]);
    }
  }, [patient.patientName]);

  const clearDrawings = () => {
    setDrawings([]);
    setSelectedDrawingIndex(null);
    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 로컬 스토리지에서도 삭제
    saveDrawings([]);
  };

  const downloadImage = () => {
    const mainCanvas = canvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    
    // 임시 캔버스 생성
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 730;
    tempCanvas.height = 556;
    const tempCtx = tempCanvas.getContext('2d');
    
    // DICOM 이미지 그리기
    tempCtx.drawImage(mainCanvas, 0, 0);
    
    // 드로잉 레이어 합성
    if (showDrawing) {
      tempCtx.drawImage(drawingCanvas, 0, 0);
    }
    
    // 다운로드
    const link = document.createElement('a');
    link.download = `${patient.patientName}_CT_${new Date().toISOString().split('T')[0]}.png`;
    link.href = tempCanvas.toDataURL();
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-5xl w-full">
        {/* 헤더 */}
        <div className="bg-gray-700 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div>
            <h2 className="text-white text-lg font-semibold">CT1.dcm</h2>
            <p className="text-gray-300 text-sm mt-1">{patient.registrationDate}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors p-2 hover:bg-gray-600 rounded"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 도구 바 */}
        <div className="bg-gray-700 px-6 py-3 border-t border-gray-600 flex items-center justify-between flex-wrap gap-4">
          {/* 드로잉 도구 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawingTool('pen')}
              className={`p-2 rounded transition-colors ${
                drawingTool === 'pen' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
              title="펜"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={() => setDrawingTool('line')}
              className={`p-2 rounded transition-colors ${
                drawingTool === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
              title="직선"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19L19 5" />
              </svg>
            </button>
            <button
              onClick={() => setDrawingTool('circle')}
              className={`p-2 rounded transition-colors ${
                drawingTool === 'circle' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
              title="원"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={2} />
              </svg>
            </button>
            <button
              onClick={() => setDrawingTool('rectangle')}
              className={`p-2 rounded transition-colors ${
                drawingTool === 'rectangle' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
              title="사각형"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" strokeWidth={2} />
              </svg>
            </button>
            <button
              onClick={() => {
                setDrawingTool('select');
                setSelectedDrawingIndex(null);
              }}
              className={`p-2 rounded transition-colors ${
                drawingTool === 'select' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
              title="선택 및 삭제"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </button>

            <div className="w-px h-8 bg-gray-600 mx-2"></div>

            {/* 색상 선택 */}
            <input
              type="color"
              value={drawingColor}
              onChange={(e) => setDrawingColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
              title="색상 선택"
            />

            {/* 선 굵기 */}
            <select
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="bg-gray-600 text-white px-3 py-2 rounded text-sm"
            >
              <option value="1">가늘게</option>
              <option value="2">보통</option>
              <option value="4">굵게</option>
              <option value="6">매우 굵게</option>
            </select>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center gap-2">
            {selectedDrawingIndex !== null && (
              <button
                onClick={deleteSelectedDrawing}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                선택 삭제
              </button>
            )}
            <button
              onClick={() => setShowDrawing(!showDrawing)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                showDrawing 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {showDrawing ? '드로잉 표시' : '드로잉 숨김'}
            </button>
            <button
              onClick={clearDrawings}
              className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
            >
              전체 지우기
            </button>
            <button
              onClick={downloadImage}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              이미지 다운로드
            </button>
          </div>
        </div>

        {/* 이미지 뷰어 */}
        <div className="bg-black p-6 rounded-b-lg flex items-center justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0"
            />
            <canvas
              ref={drawingCanvasRef}
              className={`absolute top-0 left-0 ${
                drawingTool === 'select' ? 'cursor-pointer' : 'cursor-crosshair'
              }`}
              style={{ opacity: showDrawing ? 1 : 0 }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <div style={{ width: '730px', height: '556px' }} />
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="bg-gray-700 px-6 py-3 rounded-b-lg flex items-center justify-end">
          <button
            onClick={downloadImage}
            className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            이미지 다운로드
          </button>
        </div>
      </div>
    </div>
  );
};

export default DicomViewer;
