import { fetchSidebarItems } from "@/state-management/slices/sidebar-slice";
import { RootState } from "@/state-management/store/app-store";
import { hasSidebarAccessForPath } from "@/utils/helpers/sidebar-routing";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

interface ModuleAccessRouteProps {
  children: React.ReactElement;
}

export default function ModuleAccessRoute({ children }: ModuleAccessRouteProps) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items, status, error } = useSelector((state: RootState) => state.sidebar);

  useEffect(() => {
    if (isAuthenticated && status === "idle") {
      dispatch(fetchSidebarItems() as any);
    }
  }, [dispatch, isAuthenticated, status]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (status === "idle" || status === "loading") {
    return (
      <div className="h-screen w-full flex items-center justify-center text-muted-foreground">
        Loading access...
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="h-screen w-full flex flex-col gap-4 items-center justify-center">
        <p className="text-sm text-destructive">{error || "Unable to verify route access."}</p>
        <button
          className="px-4 py-2 text-sm border rounded-md"
          onClick={() => dispatch(fetchSidebarItems() as any)}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasSidebarAccessForPath(items, location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
