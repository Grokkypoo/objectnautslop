Video2dsprite output (Grok Build pipeline)
==========================================
base/           base still on #FF00FF
video/          imagine_image_to_video clip
frames-raw/     decoded frames
frames-clean/   chroma-keyed RGBA frames
sprite/         sampled normalized sprites + strips/grids/GIFs
pipeline-meta.json

This folder was produced for Grok Build (imagine_text_to_image + imagine_image_to_video).
Codex/other agents cannot run the video step; they can still re-sample
existing frames with: python video2dsprite.py sample --clean-dir ...

{
  "mode": "sample",
  "clean_dir": "/workspace/assets/sprites/video2dsprite/cat-walk/frames-clean",
  "total_clean": 73,
  "sets": [
    {
      "count": 8,
      "tag": "",
      "sprites": [
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/sprite_01.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/sprite_02.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/sprite_03.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/sprite_04.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/sprite_05.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/sprite_06.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/sprite_07.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/sprite_08.png"
      ],
      "strip": "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/run-strip-8.png",
      "grid": "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/run-grid-8.png",
      "gif": "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/run-preview-8.gif",
      "gif_ms": 80,
      "indices": [
        72,
        62,
        51,
        41,
        31,
        21,
        10,
        0
      ]
    },
    {
      "count": 16,
      "tag": "x16",
      "sprites": [
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/x16/sprite_01.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/x16/sprite_02.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/x16/sprite_03.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/x16/sprite_04.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/x16/sprite_05.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/x16/sprite_06.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/x16/sprite_07.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/x16/sprite_08.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/x16/sprite_09.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/x16/sprite_10.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/x16/sprite_11.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/x16/sprite_12.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/x16/sprite_13.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/x16/sprite_14.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/x16/sprite_15.png",
        "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/x16/sprite_16.png"
      ],
      "strip": "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/run-strip-16.png",
      "grid": "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/run-grid-16.png",
      "gif": "/workspace/assets/sprites/video2dsprite/cat-walk/sprite/run-preview-16.gif",
      "gif_ms": 60,
      "indices": [
        72,
        67,
        62,
        58,
        53,
        48,
        43,
        38,
        34,
        29,
        24,
        19,
        14,
        10,
        5,
        0
      ]
    }
  ]
}
