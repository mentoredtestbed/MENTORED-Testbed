# docker-images


## Building and pushing multiple images

```bash
sudo ./publish-container.sh ghcr.io/mentoredtestbed/ latest --all
```

(Otherwise it will build only files in `to-build.csv`)