# echo PATH = $PATH
# echo vessel @ `which vessel`
echo
echo == Create.
echo

dfx canister create --all

echo
echo == Build.
echo

dfx build

echo
echo == Install.
echo

dfx canister install --all


echo
echo == Deploy.
echo

# dfx deploy

yarn start