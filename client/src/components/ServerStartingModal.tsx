const ServerStartingModal = () => {
  return (
    <div className="server-starting-modal modal">
      <div className="server-starting-modal__smoke modal-smoke"></div>
      <div className="server-starting-modal__content modal-content">
        <div className="server-starting-modal__spin-loader spin-loader"></div>
        <p className="server-starting-modal__title modal-text">サーバー起動中</p>
      </div>
    </div>
  );
};

export default ServerStartingModal;
