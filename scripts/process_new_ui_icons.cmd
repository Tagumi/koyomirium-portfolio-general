@echo off
set "GEN=C:\Users\moony\.codex\generated_images\019fd55f-ab62-7791-bbc4-7977656729e4"
set "OUT=portfolio-assets\photoshop\banner-source-assets"
set "PY=C:\Users\moony\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
set "KEY=C:\Users\moony\.codex\skills\.system\imagegen\scripts\remove_chroma_key.py"

echo F|xcopy /Y "%GEN%\exec-cf939448-af05-4807-8f71-de417794e536.png" "%OUT%\18-calendar-coarse-magenta-source.png" >nul
echo F|xcopy /Y "%GEN%\exec-c54fed74-15ee-4062-9b5d-b8c88e1931c9.png" "%OUT%\19-plus-coarse-magenta-source.png" >nul
echo F|xcopy /Y "%GEN%\exec-2b6dc099-96fa-4d6b-91b9-491f7854c50c.png" "%OUT%\20-star-coarse-magenta-source.png" >nul
echo F|xcopy /Y "%GEN%\exec-ec1a5943-fdce-4343-926a-f3e90a43691c.png" "%OUT%\21-water-drop-coarse-magenta-source.png" >nul
echo F|xcopy /Y "%GEN%\exec-c632e145-ef0c-4018-91bb-50ab21520207.png" "%OUT%\22-fish-coarse-magenta-source.png" >nul

"%PY%" "%KEY%" --input "%OUT%\18-calendar-coarse-magenta-source.png" --out "%OUT%\18-calendar-coarse-transparent.png" --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill
"%PY%" "%KEY%" --input "%OUT%\19-plus-coarse-magenta-source.png" --out "%OUT%\19-plus-coarse-transparent.png" --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill
"%PY%" "%KEY%" --input "%OUT%\20-star-coarse-magenta-source.png" --out "%OUT%\20-star-coarse-transparent.png" --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill
"%PY%" "%KEY%" --input "%OUT%\21-water-drop-coarse-magenta-source.png" --out "%OUT%\21-water-drop-coarse-transparent.png" --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill
"%PY%" "%KEY%" --input "%OUT%\22-fish-coarse-magenta-source.png" --out "%OUT%\22-fish-coarse-transparent.png" --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill

