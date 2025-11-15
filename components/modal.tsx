const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" style={{animationDuration: '0.2s'}}>
        <Card className="w-full max-w-lg mx-4">
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </div>
    );
  };

export default Modal;