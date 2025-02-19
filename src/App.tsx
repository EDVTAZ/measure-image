import {
  createDropzone,
  fileUploader,
  type UploadFile,
} from "@solid-primitives/upload";
import { pointerPosition } from "@solid-primitives/pointer";
import { createSignal, For, Show, type Component } from "solid-js";
import styles from "./App.module.css";

function percentFormat(percentage: number) {
  return Intl.NumberFormat(navigator.language, {
    style: "percent",
  }).format(percentage);
}

function formatPoint(
  pos: { x: number; y: number },
  dims: { width: number; height: number; ratio: number }
): string {
  const x = Math.round(pos.x * dims.ratio);
  const y = Math.round(pos.y * dims.ratio);
  return `${x} ; ${y} // ${percentFormat(x / dims.width)} ; ${percentFormat(
    y / dims.height
  )}`;
}

const App: Component = () => {
  const [files, setFiles] = createSignal<UploadFile[]>([]);
  const [imageDimensions, setImageDimensions] = createSignal({
    width: 0,
    height: 0,
    ratio: 0,
  });
  const [pos, setPos] = createSignal({ x: 0, y: 0 });
  const [points, setPoints] = createSignal<{ x: number; y: number }[]>([]);

  const { setRef: dropzoneRef } = createDropzone({
    onDrop: async (files) => {
      const images = files.filter((f) => f.file.type.startsWith("image/"));
      setFiles(images.slice(0, 1));
      setPoints([]);
    },
  });

  return (
    <div ref={dropzoneRef} class={styles.container}>
      <div class={styles.imageContainer}>
        <Show
          when={files().length > 0}
          fallback={
            <div>
              Load an image by dropping it or clicking on the button below!
            </div>
          }
        >
          <img
            class={styles.measuredImg}
            draggable="false"
            src={files()[0].source}
            use:pointerPosition={(e) => {
              setPos({ x: e.x, y: e.y });
            }}
            on:load={(e) => {
              setImageDimensions({
                width: e.target.naturalWidth,
                height: e.target.naturalHeight,
                ratio: e.target.naturalWidth / e.target.clientWidth,
              });
            }}
            on:click={() => {
              setPoints((prev) => {
                return [...prev, pos()];
              });
            }}
          />
        </Show>
        <div>
          <input
            type="file"
            multiple={false}
            accept="image/*"
            use:fileUploader={{
              userCallback: (fs) => {
                setPoints([]);
              },
              setFiles,
            }}
          />
        </div>
      </div>
      <div class={styles.stats}>
        <Show when={imageDimensions().width > 0}>
          <div>
            {imageDimensions().width} x {imageDimensions().height}
          </div>
          <div>{formatPoint(pos(), imageDimensions())}</div>
          <hr />
          <For each={points()}>
            {(item, index) => (
              <div>
                <div>{formatPoint(item, imageDimensions())}</div>
                <Show when={index() % 2 === 1}>
                  <div>{`--> ${formatPoint(
                    {
                      x: (item.x + points()[index() - 1].x) / 2,
                      y: (item.y + points()[index() - 1].y) / 2,
                    },
                    imageDimensions()
                  )}`}</div>
                  <hr />
                </Show>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
};

export default App;
