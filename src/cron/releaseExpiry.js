// import Order from "../model/OrderModel.js";
// import Asset from "../model/coAssetModel.js";

// export const releaseExpiredReservations =
//   async () => {
//     try {
//       const expiredOrders =
//         await Order.find({
//           status: "PENDING_PAYMENT",
//           expiresAt: {
//             $lte: new Date(),
//           },
//         });
//         console.log("Expired orders found: ", expiredOrders.length);

//       for (const order of expiredOrders){

//         await Asset.findByIdAndUpdate(
//           order.assetId,
//           {
//             $inc: {
//               availableFractions:
//                 order.fractions,

//               reservedFractions:
//                 -order.fractions,
//             },
//           }
//         );
//         order.status = "EXPIRED";
//         await order.save();
//         console.log(
//           `Released reservation for order ${order._id}`
//         );
//       }

//     } catch (error) {
//       console.log(error);
//     }
//   };




import Order from "../model/OrderModel.js";
import Asset from "../model/coAssetModel.js";

export const releaseExpiredReservations =
  async () => {
    try {
      const expiredOrders = await Order.find({
        status: "PENDING_PAYMENT",
        expiresAt: {
          $lte: new Date(),
        },
      }).select("_id assetId fractions");

      console.log(
        "Expired orders found:",
        expiredOrders.length
      );

      for (const order of expiredOrders) {
        /*
          Atomically claim this order.

          Agar kisi aur process ne already
          EXPIRED/COMPLETED kar diya hai,
          updatedOrder null milega.
        */
        const updatedOrder =
          await Order.findOneAndUpdate(
            {
              _id: order._id,
              status: "PENDING_PAYMENT",
            },
            {
              $set: {
                status: "EXPIRED",
              },
            },
            {
              returnDocument: "after",
            }
          );

        if (!updatedOrder) {
          continue;
        }

        const asset =
          await Asset.findOneAndUpdate(
            {
              _id: updatedOrder.assetId,

              reservedFractions: {
                $gte:
                  updatedOrder.fractions,
              },
            },
            {
              $inc: {
                availableFractions:
                  updatedOrder.fractions,

                reservedFractions:
                  -updatedOrder.fractions,
              },
            },
            {
              returnDocument: "after",
            }
          );

        if (!asset) {
          console.error(
            `Failed to release fractions for order ${updatedOrder._id}`
          );

          continue;
        }

        console.log(
          `Released reservation for order ${updatedOrder._id}`
        );
      }
    } catch (error) {
      console.error(
        "Release Expired Reservations Error:",
        error
      );
    }
  };