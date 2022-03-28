import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

const Avatar = (props) => {
  const { scene } = useGLTF(props.url, false);

  return (
    <group>
      <primitive object={scene} />
    </group>
  );
};

function App() {
  const [url, setUrl] = useState("");

  function subscribe(event) {
    const json = parse(event);

    if (json?.source !== "readyplayerme") {
      return;
    }

    const frame = document.getElementById("frame");

    // Susbribe to all events sent from Ready Player Me once frame is ready
    if (json.eventName === "v1.frame.ready") {
      frame.contentWindow.postMessage(
        JSON.stringify({
          target: "readyplayerme",
          type: "subscribe",
          eventName: "v1.**",
        }),
        "*"
      );
    }

    // Get avatar GLB URL
    if (json.eventName === "v1.avatar.exported") {
      setUrl(json.data.url + "?v=" + Math.random());
      frame.style.visibility = false;
    }
  }

  function parse(event) {
    try {
      return JSON.parse(event.data);
    } catch (error) {
      return null;
    }
  }

  useEffect(() => {
    window.addEventListener("message", subscribe);
  }, []);

  return (
    <div style={{ height: 900, display: "flex" }}>
      <iframe
        id="frame"
        title="Ready Player Me"
        style={{ width: 900 }}
        allow="camera *; microphone *"
        src="https://demo.readyplayer.me/avatar?frameApi"
      ></iframe>
      {url && (
        <Canvas
          style={{ width: 900, height: 900 }}
          camera={{
            fov: 45,
            position: [0, 1, 2.5],
          }}
        >
          <ambientLight />
          <directionalLight />
          <OrbitControls target={[0, 1, 0]} />
          <Suspense fallback={null}>
            <Avatar url={url} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

export default App;
