import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. 레이아웃 및 공통 컴포넌트 호출
import AdminLayout from './components/AdminLayout';

// 2. 페이지(Pages) 호출 
// [중요] 폴더 내 실제 파일명과 대소문자까지 일치해야 오류가 나지 않습니다.
import AdminDashboard from './pages/AdminDashboard';
import TaskCreate from './pages/TaskCreate'; // '업무 배정' 화면 (신규 생성)
import TaskEdit from './pages/TaskEdit';     // '업무 수정' 화면 (기존 데이터 수정)
import ProjectManagement from './pages/ProjectManagement';  //'프로젝트관리 화면
import AdminProjectAuth from './pages/AdminProjectAuth'; // '권한부여'화면

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 
          [관리자 전용 레이아웃 루트]
          /admin 으로 시작하는 모든 경로는 AdminLayout(사이드바 포함)을 기본으로 가집니다.
        */}
        <Route path="/admin" element={<AdminLayout />}>
          
          {/* /admin 접속 시 바로 대시보드로 리다이렉트하거나 index로 설정 */}
          <Route index element={<AdminDashboard />} />
          
          {/* 관리자 대시보드 요약 화면 */}
          <Route path="dashboard" element={<AdminDashboard />} />
          
          {/* 권한 부여 메뉴 클릭 시 이동할 경로 설정 */}
            <Route path="/admin/project-auth" element={<AdminProjectAuth />} />

          {/* 
             업무 배정 화면 (TaskCreate) 
             - 프로젝트 관리 메뉴에서 '프로젝트 생성' 클릭 시 이동할 경로
          */}
          <Route path="task-create" element={<TaskCreate />} />
          
          {/* 
             업무 수정 화면 (TaskEdit)
             - 사이드바의 '업무 배정' 메뉴를 눌렀을 때 보여줄 실제 수정 화면
          */}
          <Route path="task-edit" element={<TaskEdit />} />
          
          {/* 프로젝트 관리 메인 화면 */}
          <Route path="projects" element={<ProjectManagement />} />

        </Route>

        {/* 
          기타 경로 설정 
          - 로그인처럼 사이드바가 없는 페이지는 AdminLayout 밖에 위치시킵니다.
        */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        
        {/* 잘못된 경로로 들어왔을 때 대시보드로 보냄 */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;