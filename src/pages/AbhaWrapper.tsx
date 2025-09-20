const AbhaWrapper = () => {
  const token = localStorage.getItem("authToken"); // or from useAuth()
    return (
      <iframe
        // src="http://localhost:8080"  // or deployed URL of ABHACARD
        // style={{ width: "100%", height: "100vh", border: "none" }}
        // title="ABHA Card"
        src={`http://localhost:8080?token=${token}`}  // ABHA portal should accept token
        style={{ width: "100%", height: "100vh", border: "none" }}
        title="ABHA Card"
      />
    );
  };
  export default AbhaWrapper;
  