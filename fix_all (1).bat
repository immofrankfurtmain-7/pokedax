@echo off
title PokeDax - Fix All
color 0A
cls
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0fix_all.ps1"
