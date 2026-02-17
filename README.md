### Test BEFORE version  (not needed remove on the submited version)
```bash
docker compose run --rm app npm run test:impl
```

### Test AFTER version 
```bash
docker compose run --rm app npm run test:meta
```
 
### Run full evaluation
```bash
docker compose run --rm app npm run evaluate
```
