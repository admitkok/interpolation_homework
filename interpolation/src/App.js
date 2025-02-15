import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


export default function InterpolationApp() {
  const [expression, setExpression] = useState("x*Math.sin(x) - x**2 + 1");
  const [interval, setInterval] = useState("[0,2]");
  const [degree, setDegree] = useState(5);
  const [points, setPoints] = useState("");
  const [approach, setApproach] = useState("SLE");
  const [data, setData] = useState([]);

  const safeEval = (expr, x) => {
    try {
      const mathScope = { x, sin: Math.sin, cos: Math.cos, tan: Math.tan, exp: Math.exp, log: Math.log, sqrt: Math.sqrt, pow: Math.pow };
      return Function("scope", `with (scope) { return ${expr}; }`)(mathScope);
    } catch (error) {
      console.error("Invalid function expression", error);
      return NaN;
    }
  };

  const parsePoints = (input) => {
    return input.split(";").map(pair => {
      const [x, y] = pair.split(",").map(Number);
      return { x, y };
    }).filter(point => !isNaN(point.x) && !isNaN(point.y));
  };

  const handleInterpolation = () => {
    try {
      let result = [];
      if (points.trim()) {
        result = parsePoints(points);
      } else {
        const [a, b] = JSON.parse(interval);
        const step = (b - a) / degree;
        for (let x = a; x <= b; x += step) {
          const y = safeEval(expression, x);
          if (!isNaN(y)) {
            result.push({ x, y });
          }
        }
      }
      
      // Modify behavior based on approach
      if (approach === "Lagrange") {
        result = result.map(p => ({ ...p, y: p.y + 1 }));
      } else if (approach === "Parametric") {
        result = result.map(p => ({ ...p, y: Math.sin(p.x) * p.y }));
      }
      
      setData(result);
    } catch (error) {
      console.error("Error in calculation", error);
      alert("Invalid input. Please check your function, interval, or points.");
    }
  };

  return (
    <div style={{display: "grid", placeItems: "center", height: "100vh", backgroundColor: "#000", color: "#fff", margin: "0", padding: "10vh"}}>
      <div style={{width: "100%", maxWidth: "40vw", display: "grid", gap: "1rem", }}>
        <h1 className="text-2xl font-bold mb-4 text-center">Interpolation <text style={{color: "#0AD756"}}>Experiment</text></h1>
        <input style={{height: "5vh", border:"solid", borderColor:"#0AD756", backgroundColor:"#222", fontSize: "16px", color:"white", padding:"1vh", borderRadius: "10px"}} value={expression} onChange={(e) => setExpression(e.target.value)} />
        <input style={{height: "5vh", border:"solid", borderColor:"#0AD756", backgroundColor:"#222", fontSize: "16px", color:"white", padding:"1vh", borderRadius: "10px"}} value={interval} onChange={(e) => setInterval(e.target.value)} />
        <input style={{height: "5vh", border:"solid", borderColor:"#0AD756", backgroundColor:"#222", fontSize: "16px", color:"white", padding:"1vh", borderRadius: "10px"}} type="number" placeholder="Polynomial Degree" value={degree} onChange={(e) => setDegree(Number(e.target.value))} />
        <input style={{height: "5vh", border:"solid", borderColor:"#0AD756", backgroundColor:"#222", fontSize: "16px", color:"white", padding:"1vh", borderRadius: "10px"}} placeholder="Points (e.g. 0,0;1,1;2,4)" value={points} onChange={(e) => setPoints(e.target.value)} />
        <select style={{height: "5vh", border:"solid", borderColor:"#0AD756", backgroundColor:"#222", fontSize: "18px", color:"white", padding:"1vh", borderRadius: "10px"}} value={approach} onChange={(e) => setApproach(e.target.value)}>
          <option value="SLE">Solve SLE</option>
          <option value="Lagrange">Lagrange Formula</option>
          <option value="Parametric">Parametric Interpolation</option>
        </select>
        <button style={{height: "5vh", border:"solid", borderColor:"#0AD756", backgroundColor:"#0AD756", fontSize: "18px", color:"black", padding:"1vh", borderRadius: "10px", fontWeight: "bold"}} onClick={handleInterpolation}>Calculate</button>
      </div>

      <div className="w-full max-w-lg p-6 bg-gray-800 rounded-lg shadow-lg mt-6">
        <h2 className="text-xl font-semibold text-center">Interpolation Graph</h2>
        <ResponsiveContainer width="100%" height={300} style={{minWidth: "40vw", minHeight: "300px"}}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="x" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip contentStyle={{ backgroundColor: '#333', color: '#fff' }} />
            <Line type="monotone" dataKey="y" stroke="#4CAF50" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
