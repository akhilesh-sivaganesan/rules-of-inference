import Header from '@/components/header';
import { Button } from '@mui/material';
import { useEffect } from 'react';
import * as THREE from 'three';

export default function Home() {
  useEffect(() => {
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let shape: THREE.Mesh;

    function init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, (window.innerWidth / 2) / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      const animationCanvas = document.getElementById('animationCanvas');
      if (animationCanvas instanceof HTMLCanvasElement) {
        renderer = new THREE.WebGLRenderer({ antialias: true, canvas: animationCanvas });
        renderer.setClearColor(0xffffff, 1); // Set background color to white
        renderer.setSize(window.innerWidth / 2, window.innerHeight);
      }

      const geometry = new THREE.TorusKnotGeometry(1.3, 0.3, 100, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0x800080, wireframe: true }); // Purple color
      shape = new THREE.Mesh(geometry, material);
      scene.add(shape);

      animate();
    }

    function animate() {
      requestAnimationFrame(animate);
      shape.rotation.x += 0.01;
      shape.rotation.y += 0.01;
      renderer.render(scene, camera);
    }

    function onWindowResize() {
      camera.aspect = (window.innerWidth / 2) / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth / 2, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize, false);

    init();

    return () => {
      window.removeEventListener('resize', onWindowResize, false);
    };
  }, []);

  return (
    <div className='flex flex-col h-screen overflow-hidden bg-white'>
      <div className="fixed w-full z-[100]">
            <div className='flex flex-row items-center justify-end p-3 bg-white space-x-2'>
                <Button variant="contained" href="/" style={{ border: '2px solid black', color: 'black', backgroundColor: 'transparent' }}>
                    Back Home
                </Button>
                <Button variant='contained' href="/statistics" style={{ border: '2px solid black', color: 'black', backgroundColor: 'transparent' }}>
                    Statistics
                </Button>
            </div>
        </div>
      <div className='flex flex-row flex-grow'>
        <canvas id='animationCanvas' className='w-1/2 h-full z-0 xs:hidden  md:block' />
        <div className='flex flex-col items-start justify-center space-y-2 w-1/2 overflow-hidden bg-white p-2'>
          <h1 className='text-4xl text-black'>Rules of Inference Generator</h1>
          <p className='w-[600px] py-2'>
          Rules of inference problems enable discrete math students to practice their logical argumentation skills. Our tool automatically generates practice material that is otherwise difficult by hand. The generator offers problems of varying difficulty levels, allowing students to track their progress through past statistics and even export problems for external usage.
          </p>
          <div className='flex flex-row flex-wrap justify-start items-center text-black text-center space-x-2'>
            
            <Button variant='contained' href='/practice?easy' className="border border-gray-200 text-white bg-slate-600 hover:bg-purple-800 hover:text-white py-1 px-4 rounded">
              Easy Practice
            </Button>
            <Button variant='contained' href='/practice?medium' className="border border-gray-200 text-white bg-slate-600 hover:bg-purple-800 hover:text-white py-1 px-4 rounded">
              Medium Practice
            </Button>
            <Button variant='contained' href='/statistics' className="border border-gray-200 text-white bg-slate-600 hover:bg-purple-800 hover:text-white py-1 px-4 rounded">
              View Statistics
            </Button>
          </div>
        </div>
      </div>
      <div className='h-16 bg-white'> {/* Footer with white background */}
        {/* Footer content */}
      </div>
    </div>
  );
}
