import { useEffect, useRef } from "react";
import Matter from "matter-js";

type GravityGalleryProps = {
  images: string[];
  size?: number;
  className?: string;
};

/**
 * Physics-based avatar gallery (per the design's OriginKit "gravitygallery"
 * annotation): circular bodies drop into the container, settle at the bottom,
 * and can be dragged with the mouse.
 */
export default function GravityGallery({ images, size = 88, className }: GravityGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const engine = Matter.Engine.create();
    const rect = container.getBoundingClientRect();
    const w = rect.width || 1408;
    const h = rect.height || 560;

    // Thick static walls just outside every edge
    const t = 200;
    Matter.Composite.add(engine.world, [
      Matter.Bodies.rectangle(w / 2, -t / 2, w + 2 * t, t, { isStatic: true }),
      Matter.Bodies.rectangle(w / 2, h + t / 2, w + 2 * t, t, { isStatic: true }),
      Matter.Bodies.rectangle(-t / 2, h / 2, t, h + 2 * t, { isStatic: true }),
      Matter.Bodies.rectangle(w + t / 2, h / 2, t, h + 2 * t, { isStatic: true }),
    ]);

    const mouse = Matter.Mouse.create(container);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.99 },
    });
    Matter.Composite.add(engine.world, mouseConstraint);
    // Matter's mouse hijacks wheel events; remove so the page can still scroll.
    const mouseEl = mouse.element as HTMLElement;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wheelHandler = (mouse as any).mousewheel as EventListener;
    mouseEl.removeEventListener("wheel", wheelHandler);
    mouseEl.removeEventListener("mousewheel", wheelHandler);
    mouseEl.removeEventListener("DOMMouseScroll", wheelHandler);
    const onLeave = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mouse as any).mouseup(new Event("mouseup"));
    };
    container.addEventListener("mouseleave", onLeave);

    // Spawn bodies in a non-overlapping grid at the top and let them fall.
    const gap = Math.max(6, size * 0.12);
    const cell = size + gap;
    const cols = Math.max(1, Math.floor((w - gap) / cell));
    const startX = (w - cols * cell) / 2 + cell / 2;
    const bodies = images.map((_, i) => {
      const jitter = ((i * 37) % 11) - 5;
      const x = startX + (i % cols) * cell + jitter;
      const y = size / 2 + gap + Math.floor(i / cols) * cell;
      return Matter.Bodies.circle(x, y, size / 2, { friction: 0.3, frictionAir: 0.02, restitution: 0.4 });
    });
    Matter.Composite.add(engine.world, bodies);

    const els = Array.from(container.querySelectorAll<HTMLElement>("[data-physics-body]"));
    let raf = 0;
    const update = () => {
      raf = requestAnimationFrame(update);
      bodies.forEach((body, i) => {
        const el = els[i];
        if (!el) return;
        el.style.visibility = "visible";
        el.style.left = `${body.position.x}px`;
        el.style.top = `${body.position.y}px`;
        el.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
      });
      Matter.Engine.update(engine);
    };
    update();

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("mouseleave", onLeave);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
    };
  }, [images, size]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
    >
      {images.map((src, i) => (
        <div
          key={i}
          data-physics-body=""
          style={{
            position: "absolute",
            visibility: "hidden",
            width: size,
            height: size,
            borderRadius: "50%",
            overflow: "hidden",
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            cursor: "grab",
          }}
          draggable={false}
        />
      ))}
    </div>
  );
}
