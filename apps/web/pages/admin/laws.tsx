/**
 * Admin Laws Page
 * Read-only interface for searching and browsing Korean occupational safety laws
 * Features: FTS5 full-text search, pagination, filtering
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';

interface LawArticle {
  id: string;
  law_code: string;
  law_title: string;
  article_no: string;
  clause_no: string | null;
  text: string;
  effective_date: string;
  keywords: string;
  source_url: string;
  created_at: string;
  updated_at: string;
}

interface LawSearchResult {
  laws: LawArticle[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface LawStats {
  total_laws: number;
  total_titles: number;
  latest_effective_date: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export default function AdminLaws() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LawSearchResult | null>(null);
  const [stats, setStats] = useState<LawStats | null>(null);
  const [titles, setTitles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedLaw, setSelectedLaw] = useState<LawArticle | null>(null);

  // Fetch law titles and stats on mount
  useEffect(() => {
    fetchTitles();
    fetchStats();
  }, []);

  // Fetch laws when search params change
  useEffect(() => {
    fetchLaws();
  }, [searchQuery, selectedTitle, currentPage, pageSize]);

  const fetchTitles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/laws/titles`);
      const data = await response.json();
      if (data.success) {
        setTitles(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch titles:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/laws/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchLaws = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      if (searchQuery.trim()) {
        params.set('query', searchQuery.trim());
      }

      if (selectedTitle) {
        params.set('law_title', selectedTitle);
      }

      const response = await fetch(`${API_BASE_URL}/api/laws/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to search laws');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch laws');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchLaws();
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedTitle('');
    setCurrentPage(1);
  };

  const handleViewDetail = (law: LawArticle) => {
    setSelectedLaw(law);
  };

  const closeDetail = () => {
    setSelectedLaw(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>법령 검색 - Safe OPS Studio Admin</title>
        <meta name="description" content="산업안전보건법 조문 검색 및 열람" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">산업안전보건 법령 검색</h1>
          <p className="text-gray-600">
            산업안전보건법 및 관련 규칙 조문을 검색하고 열람할 수 있습니다 (읽기 전용)
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-1">총 조문 수</div>
              <div className="text-3xl font-bold text-blue-600">{stats.total_laws}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-1">법령 종류</div>
              <div className="text-3xl font-bold text-green-600">{stats.total_titles}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-1">최신 시행일</div>
              <div className="text-3xl font-bold text-purple-600">
                {stats.latest_effective_date.split('-')[0]}
              </div>
            </div>
          </div>
        )}

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Keyword Search */}
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  키워드 검색 (법령명, 조문 내용, 키워드)
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="예: 추락, 안전난간, 제38조 등"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Law Title Filter */}
              <div>
                <label htmlFor="law-title" className="block text-sm font-medium text-gray-700 mb-2">
                  법령명 필터
                </label>
                <select
                  id="law-title"
                  value={selectedTitle}
                  onChange={(e) => setSelectedTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">전체</option>
                  {titles.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? '검색 중...' : '검색'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                초기화
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">⚠️ {error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Results Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <span className="text-lg font-semibold text-gray-900">검색 결과</span>
                <span className="ml-2 text-sm text-gray-600">
                  (총 {result.total}건, {result.page}/{result.total_pages} 페이지)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">페이지 크기:</label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            {/* Results List */}
            <div className="divide-y divide-gray-200">
              {result.laws.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  검색 결과가 없습니다. 다른 키워드로 검색해보세요.
                </div>
              ) : (
                result.laws.map((law) => (
                  <div
                    key={law.id}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleViewDetail(law)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mr-2">
                          {law.law_title}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {law.article_no}
                          {law.clause_no && ` ${law.clause_no}`}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{law.effective_date}</span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 mb-2">{law.text}</p>
                    <div className="flex flex-wrap gap-1">
                      {law.keywords.split(',').map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {result.total_pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={!result.has_prev}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  이전
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, result.total_pages) }, (_, i) => {
                    const pageNum =
                      result.total_pages <= 5
                        ? i + 1
                        : Math.max(1, Math.min(result.page - 2 + i, result.total_pages - 4 + i));
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded ${
                          pageNum === result.page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!result.has_next}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        )}

        {/* Detail Modal */}
        {selectedLaw && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeDetail}
          >
            <div
              className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">조문 상세</h2>
                <button
                  onClick={closeDetail}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">법령명</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedLaw.law_title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">조항</label>
                    <p className="text-gray-900">
                      {selectedLaw.article_no}
                      {selectedLaw.clause_no && ` ${selectedLaw.clause_no}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">시행일</label>
                    <p className="text-gray-900">{selectedLaw.effective_date}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">조문 내용</label>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200">
                    {selectedLaw.text}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">키워드</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedLaw.keywords.split(',').map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">원문 링크</label>
                  <a
                    href={selectedLaw.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block mt-1"
                  >
                    {selectedLaw.source_url}
                  </a>
                </div>
                <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                  법령 코드: {selectedLaw.law_code} | 등록일: {selectedLaw.created_at.split('T')[0]}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
