import { message } from "antd";
import "./App.css";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Home } from "./Home";
import { Compare } from "./Compare";

function App() {
  // Ant Design message API for displaying notifications
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {/* Router setup using HashRouter for client-side routing */}
      <Router>
        <div className="mainWrapper">
          <main>
            {/* Define the routes for the application */}
            <Routes>
              {/* Route for the Home component */}
              <Route path="/" element={<Home messageApi={messageApi} />} />
              {/* Route for the Compare component with a dynamic CID parameter */}
              <Route
                path="/compare/:cid"
                element={<Compare messageApi={messageApi} />}
              />
            </Routes>
          </main>
          {/* Context holder for Ant Design messages */}
          {contextHolder}
        </div>
      </Router>
    </>
  );
}

export default App;
