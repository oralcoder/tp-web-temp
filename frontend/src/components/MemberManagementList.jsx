import { useState, useRef } from 'react';

const MemberManagementList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const searchInputRef = useRef(null);
  
  // 필터 상태
  const [filters, setFilters] = useState({
    status: 'all', // 'all', '사용가능', '접근제한'
    permission: 'all', // 'all', '의뢰', '공정', '출고', '관리'
  });

  // 샘플 데이터
  const [allMembers, setAllMembers] = useState([
    {
      id: 1,
      name: '김철수',
      username: 'kimcs',
      phone: '010-1234-5678',
      email: 'kimcs@example.com',
      permissions: ['의뢰', '공정'],
      status: '사용가능',
    },
    {
      id: 2,
      name: '이영희',
      username: 'leeyh',
      phone: '010-2345-6789',
      email: 'leeyh@example.com',
      permissions: ['공정', '출고'],
      status: '사용가능',
    },
    {
      id: 3,
      name: '박민수',
      username: 'parkms',
      phone: '010-3456-7890',
      email: 'parkms@example.com',
      permissions: ['관리'],
      status: '사용가능',
    },
    {
      id: 4,
      name: '정수진',
      username: 'jeongsj',
      phone: '010-4567-8901',
      email: 'jeongsj@example.com',
      permissions: ['의뢰', '공정', '출고'],
      status: '접근제한',
    },
    {
      id: 5,
      name: '최동욱',
      username: 'choidw',
      phone: '010-5678-9012',
      email: 'choidw@example.com',
      permissions: ['의뢰'],
      status: '사용가능',
    },
  ]);



  // 검색 및 필터링
  const filteredMembers = allMembers.filter(member => {
    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        member.name.toLowerCase().includes(query) ||
        member.username.toLowerCase().includes(query) ||
        member.phone.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.status.toLowerCase().includes(query) ||
        member.permissions.some(p => p.toLowerCase().includes(query))
      );
      if (!matchesSearch) return false;
    }

    // 상태 필터
    if (filters.status !== 'all' && member.status !== filters.status) {
      return false;
    }

    // 권한 필터
    if (filters.permission !== 'all' && !member.permissions.includes(filters.permission)) {
      return false;
    }

    return true;
  });

  const totalItems = filteredMembers.length;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchQuery('');
    setCurrentPage(1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  // 필터 관련 함수
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      permission: 'all',
    });
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.permission !== 'all') count++;
    return count;
  };

  // 상태 변경
  const handleStatusChange = (memberId, newStatus) => {
    setAllMembers(prevMembers =>
      prevMembers.map(member =>
        member.id === memberId ? { ...member, status: newStatus } : member
      )
    );
  };

  // 권한 토글 (직접 수정)
  const toggleMemberPermission = (memberId, permission) => {
    setAllMembers(prevMembers =>
      prevMembers.map(member => {
        if (member.id === memberId) {
          const hasPermission = member.permissions.includes(permission);
          const newPermissions = hasPermission
            ? member.permissions.filter(p => p !== permission)
            : [...member.permissions, permission];
          return { ...member, permissions: newPermissions };
        }
        return member;
      })
    );
  };

  const allPermissions = ['의뢰', '공정', '출고', '관리'];

  const getPermissionBadgeColor = (permission) => {
    switch (permission) {
      case '의뢰':
        return 'bg-slate-700 text-slate-50';
      case '공정':
        return 'bg-slate-600 text-slate-50';
      case '출고':
        return 'bg-slate-500 text-slate-50';
      case '관리':
        return 'bg-slate-800 text-slate-50';
      default:
        return 'bg-slate-200 text-slate-600';
    }
  };

  const getStatusStyle = (status) => {
    return status === '사용가능'
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-slate-400 text-white hover:bg-slate-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <h1 className="text-3xl font-bold text-center mb-8">회원정보 관리</h1>

        {/* 검색 및 액션 바 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            {/* 왼쪽: 검색창 + 필터 */}
            <div className="flex items-center gap-3 flex-1">
              {/* 검색창 */}
              <div className="relative flex items-center w-80">
                <div className="absolute left-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="검색어를 입력하세요"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    type="button"
                  >
                    <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* 상태 필터 */}
              <label htmlFor="statusFilter" className="sr-only">상태 필터</label>
              <select
                id="statusFilter"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer h-[42px]"
              >
                <option value="all">상태: 전체</option>
                <option value="사용가능">사용가능</option>
                <option value="접근제한">접근제한</option>
              </select>

              {/* 권한 필터 */}
              <label htmlFor="permissionFilter" className="sr-only">권한 필터</label>
              <select
                id="permissionFilter"
                value={filters.permission}
                onChange={(e) => handleFilterChange('permission', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer h-[42px]"
              >
                <option value="all">권한: 전체</option>
                <option value="의뢰">의뢰</option>
                <option value="공정">공정</option>
                <option value="출고">출고</option>
                <option value="관리">관리</option>
              </select>

              {/* 필터 초기화 버튼 */}
              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors h-[42px]"
                >
                  초기화
                </button>
              )}
            </div>

            {/* 오른쪽: 회원 추가 버튼 */}
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium ml-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              회원 추가
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-600 text-white">
                <th className="px-4 py-3 text-center text-sm font-medium w-16">번호</th>
                <th className="px-4 py-3 text-center text-sm font-medium">이름</th>
                <th className="px-4 py-3 text-center text-sm font-medium">아이디</th>
                <th className="px-4 py-3 text-center text-sm font-medium">전화번호</th>
                <th className="px-4 py-3 text-center text-sm font-medium">이메일주소</th>
                <th className="px-4 py-3 text-center text-sm font-medium">권한</th>
                <th className="px-4 py-3 text-center text-sm font-medium w-32">상태</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center">{member.id}</td>
                    <td className="px-4 py-3 text-center font-medium">{member.name}</td>
                    <td className="px-4 py-3 text-center">{member.username}</td>
                    <td className="px-4 py-3 text-center">{member.phone}</td>
                    <td className="px-4 py-3 text-center text-sm">{member.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {allPermissions.map(permission => {
                          const isChecked = member.permissions.includes(permission);
                          return (
                            <label
                              key={permission}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all bg-slate-50 hover:bg-slate-100"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleMemberPermission(member.id, permission)}
                                className="w-5 h-5 text-slate-700 border-slate-300 rounded focus:ring-slate-500 focus:ring-offset-0 cursor-pointer"
                              />
                              <span className={`text-sm transition-colors ${
                                isChecked ? 'text-slate-900 font-semibold' : 'text-slate-500 font-normal'
                              }`}>
                                {permission}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={member.status}
                        onChange={(e) => handleStatusChange(member.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 transition-colors ${getStatusStyle(member.status)}`}
                      >
                        <option value="사용가능">사용가능</option>
                        <option value="접근제한">접근제한</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    {searchQuery ? `"${searchQuery}"에 대한 검색 결과가 없습니다.` : '회원 정보가 없습니다.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 하단 페이지네이션 */}
        <div className="mt-6 flex items-center justify-between">
          {/* 왼쪽: 빈 공간 */}
          <div className="w-32"></div>

          {/* 중앙: 페이지 정보 + 페이지네이션 */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>페이지당</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>개</span>
            </div>

            <div className="text-sm text-gray-600">
              <span className="font-medium">1-{Math.min(itemsPerPage, totalItems)}</span>
              <span className="mx-1">of</span>
              <span className="font-medium">{totalItems}</span>
            </div>

            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="처음">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="이전">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors min-w-[2rem]">
                1
              </button>
              <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="다음">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="마지막">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* 오른쪽: 빈 공간 (균형) */}
          <div className="w-32"></div>
        </div>
      </div>
    </div>
  );
};

export default MemberManagementList;
