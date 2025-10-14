import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "../ui/dialog";

import { Button } from "../ui/button";

import { logoutUser, setModalLogout } from "@/store/slices/authSlice";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

const LogoutModal = () => {
  const dispatch = useAppDispatch();
  const { logout } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(setModalLogout(false));
  };

  return (
    <Dialog open={logout} onOpenChange={() => dispatch(setModalLogout(false))}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Cerrar sesion
          </DialogTitle>
          <DialogDescription>Esta seguro de cerrar sesion ?.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Button variant="destructive" onClick={() => handleLogout()}>
            Aceptar
          </Button>
          <Button
            variant="secondary"
            onClick={() => dispatch(setModalLogout(false))}
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutModal;
