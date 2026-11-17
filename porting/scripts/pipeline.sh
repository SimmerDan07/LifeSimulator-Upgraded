#!/bin/bash
# Full cleanup pipeline: decompiled Java -> clean, resolved, constant-patched Java.
set -e
cd /home/claude
rm -rf clean
python3 -I scripts/clean_java.py decomp2/sources clean
python3 -I scripts/resolve_when.py clean res_decoded/smali | tail -2
python3 -I scripts/patch_consts.py clean res_decoded/smali
python3 -I scripts/fixup_java.py clean
python3 -I scripts/restore_rids.py clean res_decoded/resources/package_1/res/values/public.xml
python3 -I scripts/java_patches.py clean
