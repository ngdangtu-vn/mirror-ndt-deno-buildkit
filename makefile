MIRROR_NAME=github-mirror
MIRROR_SRC=git@github.com:ngdangtu-vn/mirror-ndt-deno-buildkit.git

.PHONY: test setup-workflow add-mirror-repo

test:
	@echo "Run test will FULL permissions"
	@deno test -A

setup-workflow:
	@echo "Enable Git hooks"
	@git config --local core.hooksPath .repo/

add-mirror-repo:
	@git remote show | grep -q "${MIRROR_NAME}" || git remote add --mirror=push "${MIRROR_NAME}" "${MIRROR_SRC}"