@echo off
title SliceHub Checks
echo.
echo ==========================================
echo  SliceHub - Project Checks
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/3] Linting client...
call npm run lint || goto :failed

echo [2/3] Type-checking client...
call npm run typecheck || goto :failed

echo [3/3] Type-checking server...
cd /d "%~dp0server"
call npm run typecheck || goto :failed

echo.
echo All checks passed.
goto :end

:failed
echo.
echo Checks failed. Review the errors above.
exit /b 1

:end
pause
