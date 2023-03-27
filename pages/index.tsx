import {
  useActiveClaimConditionForWallet,
  useAddress,
  useClaimConditions,
  useClaimedNFTSupply,
  useClaimerProofs,
  useClaimIneligibilityReasons,
  useContract,
  useContractMetadata,
  useUnclaimedNFTSupply,
  Web3Button,
} from "@thirdweb-dev/react";
import { BigNumber, utils } from "ethers";
import type { NextPage } from "next";
import { useMemo, useState } from "react";
import styles from "../styles/Theme.module.css";
import { parseIneligibility } from "../utils/parseIneligibility";

// Put Your NFT Drop Contract address from the dashboard here
const myNftDropContractAddress = "0x7C704557750493c6B375621fCe3B1559973ccddF";

const Home: NextPage = () => {
  const { contract: nftDrop } = useContract(myNftDropContractAddress);

  const address = useAddress();
  const [quantity, setQuantity] = useState(1);

  const { data: contractMetadata } = useContractMetadata(nftDrop);

  const claimConditions = useClaimConditions(nftDrop);

  const activeClaimCondition = useActiveClaimConditionForWallet(
    nftDrop,
    address || ""
  );
  

  return (
    <div className={styles.container}>
      <div className={styles.mintInfoContainer}>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className={styles.infoSide}>
              {/* Title of your NFT Collection */}
              <h1>{contractMetadata?.name}</h1>
              {/* Description of your NFT Collection */}
              <p className={styles.description}>
                {contractMetadata?.description}
              </p>
            </div>

            <div className={styles.imageSide}>
              {/* Image Preview of NFTs */}
              <img
                className={styles.image}
                src={contractMetadata?.image}
                alt={`${contractMetadata?.name} preview image`}
              />
              <div>
                {/* Powered by thirdweb */}{" "}
                <a href="https://goerli.etherscan.io/address/0x44ea9ed1d488c41bd80e056df2619f4d917a2d6b" target="_blank" rel="noreferrer">0x44ea...2d6b</a>
              </div>

              {/* Amount claimed so far */}
              <div className={styles.mintCompletionArea}>
                <div className={styles.mintAreaLeft}>
                  <p>Total Minted</p>
                </div>
                <div className={styles.mintAreaRight}>
                  {claimedSupply && unclaimedSupply ? (
                    <p>
                      <b>{numberClaimed}</b>
                      {" / "}
                      {numberTotal}
                    </p>
                  ) : (
                    // Show loading state if we're still loading the supply
                    <p>Loading...</p>
                  )}
                </div>
              </div>

              {claimConditions.data?.length === 0 ||
              claimConditions.data?.every(
                (cc) => cc.maxClaimableSupply === "0"
              ) ? (
                <div>
                  <h2>
                    This drop is not ready to be minted yet. (No claim condition
                    set)
                  </h2>
                </div>
              ) : (
                <>
                  <p>Quantity</p>
                  <div className={styles.quantityContainer}>
                    <button
                      className={`${styles.quantityControlButton}`}
                      onClick={() => setQuantity(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>

                    <h4>{quantity}</h4>

                    <button
                      className={`${styles.quantityControlButton}`}
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={quantity >= maxClaimable}
                    >
                      +
                    </button>
                  </div>

                  <div className={styles.mintContainer}>
                    {isSoldOut ? (
                      <div>
                        <h2>Sold Out</h2>
                      </div>
                    ) : (
                      <Web3Button
                        contractAddress={nftDrop?.getAddress() || ""}
                        action={(cntr) => cntr.erc721.claim(quantity)}
                        isDisabled={!canClaim || buttonLoading}
                        onError={(err) => {
                          console.error(err);
                          alert("Error claiming NFTs");
                        }}
                        onSuccess={() => {
                          setQuantity(1);
                          alert("Successfully claimed NFTs");
                        }}
                      >
                        {buttonLoading ? "Loading..." : buttonText}
                      </Web3Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
