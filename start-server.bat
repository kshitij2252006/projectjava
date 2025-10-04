@echo off
cd /d "c:\Users\dell\.vscode\javaproject\Hotel-Management"
echo Starting Hotel Management System Backend...
echo.
echo Backend will be available at: http://localhost:8080
echo Frontend will be available at: http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo.
mvnw.cmd spring-boot:run
pause