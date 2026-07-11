echo "Legacy Yoroi Classic CSL publishing is disabled."
echo "This fork is superseded by dcSpark cardano-multiplatform-lib packages."
return 1 2>/dev/null || exit 1

if [ $1 = "prod" ];
then RELEASE_TYPE="prod"
elif [ $1 = "beta" ];
then RELEASE_TYPE="beta"
else
  echo "First parameter is expected 'prod' or 'beta'"
  return 1
fi

echo "Preparing ${RELEASE_TYPE} release"

. ./build-and-test.sh \
&& npm run js:publish-nodejs:${RELEASE_TYPE}:no-gc \
&& npm run js:publish-browser:${RELEASE_TYPE}:no-gc \
&& npm run js:publish-browser-inlined:${RELEASE_TYPE}:no-gc \
&& npm run js:publish-asm:${RELEASE_TYPE}:no-gc \
&& npm run js:publish-nodejs:${RELEASE_TYPE}:gc \
&& npm run js:publish-browser:${RELEASE_TYPE}:gc \
&& npm run js:publish-browser-inlined:${RELEASE_TYPE}:gc \
&& npm run js:publish-asm:${RELEASE_TYPE}:gc \
&& (cd rust; cargo publish --allow-dirty)
