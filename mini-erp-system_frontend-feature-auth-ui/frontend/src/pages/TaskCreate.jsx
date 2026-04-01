import React from 'react';
import { PlusCircle, Calendar } from 'lucide-react';

const TaskCreate = () => {
  return (
    <div className="animate-fadeIn">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          🚀 업무 배정 (새 Task 생성)
        </h2>
        <p className="text-sm text-gray-500 mt-1">프로젝트 참여자에게 새로운 Task를 할당합니다.</p>
      </header>

      <div className="max-w-3xl bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mx-auto">
        <h3 className="text-lg font-bold mb-6 text-gray-700 flex items-center gap-2">
           ➕ 새 Task 생성
        </h3>
        
        <div className="space-y-6">
          {/* Task 제목 */}
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">Task 제목 *</label>
            <input type="text" placeholder="새로운 업무 명칭을 입력하세요" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
          </div>

          {/* 프로젝트 기간 설정 (시작일, 종료일) */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">시작일 *</label>
              <div className="relative">
                <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">종료일(마감) *</label>
              <div className="relative">
                <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-sm outline-none" />
              </div>
            </div>
          </div>

          {/* 우선순위 */}
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">우선순위 설정</label>
            <div className="flex gap-4">
              {['낮음', '중간', '높음'].map((p) => (
                <label key={p} className="flex-1 cursor-pointer">
                  <input type="radio" name="priority" className="hidden peer" defaultChecked={p === '중간'} />
                  <div className="text-center py-3 rounded-xl border border-gray-200 bg-gray-50 peer-checked:bg-emerald-50 peer-checked:border-emerald-500 peer-checked:text-emerald-600 font-bold text-sm transition-all">
                    {p}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 업무 설명 */}
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">Task 설명</label>
            <textarea rows="5" placeholder="업무의 상세 목표와 가이드라인을 입력하세요" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-sm outline-none resize-none focus:ring-2 focus:ring-emerald-500"></textarea>
          </div>

          <button className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 mt-4">
            <PlusCircle size={20} /> Task 생성 및 배정
          </button>
        </div>
      </div>
    </div>
  );
};
export default TaskCreate;