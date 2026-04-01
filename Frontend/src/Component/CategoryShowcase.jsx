import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Star,
  ShoppingCart,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "http://localhost:5000/api";

export const categoriesData = [
  {
    slug: "medicine",
    name: "Medicine & Pharmaceuticals",
    desc: "APIs, generics and medical devices",
    image: "https://www.biopharlifesciences.co.in/public/Blogs/1735552692jpg",
  },
  {
    slug: "cosmetics",
    name: "Cosmetics & Beauty",
    desc: "Skincare, makeup & perfumes",
    image: "https://cdn.britannica.com/35/222035-050-C68AD682/makeup-cosmetics.jpg",
  },
  {
    slug: "personal-care",
    name: "Personal Care",
    desc: "Daily hygiene & grooming products",
    image: "https://cdn.shopify.com/s/files/1/0646/1551/4330/files/Importance_of_Personal_Care_Products_480x480.webp?v=1673811372",
  },
  {
    slug: "food",
    name: "Food & Agro Products",
    desc: "Rice, spices, oils & pulses",
    image: "https://static.vecteezy.com/system/resources/thumbnails/036/215/572/small/ai-generated-healthy-eating-wholegrain-cereal-plant-organic-food-vegetarian-meal-generated-by-ai-photo.jpg",
  },
  {
    slug: "beverages",
    name: "Beverages",
    desc: "Tea, juices, energy drinks & coffee",
    image: "https://restaurantindia.s3.ap-south-1.amazonaws.com/s3fs-public/2026-03/beverages1.jpg",
  },
  {
    slug: "confectionery",
    name: "Confectionery & Snacks",
    desc: "Chocolates, biscuits & namkeen",
    image: "https://cdn.prod.website-files.com/63cf34956bc59159af577c42/64237ff9b0a52d91ed0e8466_confectionery%20feature%20image.jpg",
  },
  {
    slug: "daily-use",
    name: "Daily Use & FMCG",
    desc: "Cleaning supplies & household essentials",
    image: "https://images.financialexpressdigital.com/2025/09/diya-0001-2025-08-11T154519.556_20250902085553_20250912090708.jpg",
  },
  {
    slug: "home-kitchen",
    name: "Home & Kitchen",
    desc: "Utensils, appliances & cookware",
    image: "https://sonigaracorp.com/images/blog/Home-Kitchen/Prioritise_Storage_Space.jpg",
  },
  {
    slug: "construction",
    name: "Construction Materials",
    desc: "Steel, cement, pipes & hardware",
    image: "https://d2d4xyu1zrrrws.cloudfront.net/website/web-ui/assets/images/temp/supply-chain-banner_msite.png",
  },
  {
    slug: "machinery",
    name: "Industrial Machinery",
    desc: "Pumps, generators & equipment",
    image: "https://www.techniwaterjet.com/wp-content/uploads/2024/01/1.jpg",
  },
  {
    slug: "electrical",
    name: "Electrical & Electronics",
    desc: "Cables, switches & lighting",
    image: "https://www.redlinegroup.com/app/data/blog/9c680883eff061d4999c1db10afcde5f.jpg",
  },
  {
    slug: "apparel",
    name: "Apparel & Garments",
    desc: "Clothing, uniforms & fashion wear",
    image: "https://media.licdn.com/dms/image/v2/D5612AQEDHdzGbCofEg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1701235776902?e=2147483647&v=beta&t=1lfEXXz0oXwZlhstZCAkMXN1c-FDSpxLpSHTki9lGqE",
  },
  {
    slug: "textiles",
    name: "Textiles & Fabrics",
    desc: "Yarn, cotton & polyester fabrics",
    image: "https://cdn.shopify.com/s/files/1/0070/5023/1919/files/towel-g89d3b7292_1920_480x480.jpg?v=1650304781",
  },
  {
    slug: "electronics",
    name: "Electronics & Components",
    desc: "Displays, PCBs & modules",
    image: "https://5.imimg.com/data5/SELLER/Default/2023/12/368947394/SS/LC/GV/183411497/electronic-components-and-semiconductor-devices.png",
  },
  {
    slug: "automotive",
    name: "Automotive Parts",
    desc: "Batteries, oils & spares",
    image: "https://images.jdmagicbox.com/quickquotes/images_main/-4ot4dcda.png",
  },
  {
    slug: "agriculture",
    name: "Agriculture & Organic",
    desc: "Seeds, fertilizers & farming tools",
    image: "https://kids.earth.org/wp-content/uploads/2022/04/Untitled-1024-%C3%97-768px-17.jpg",
  },
  {
    slug: "packaging",
    name: "Packaging Materials",
    desc: "Boxes, bottles & wrapping",
    image: "https://healeypackaging.co.uk/wp-content/uploads/2025/07/Types-of-Packaging-Materials-1-scaled.webp",
  },
  {
    slug: "pet-supplies",
    name: "Pet Supplies",
    desc: "Pet food, grooming & accessories",
    image: "https://s32519.pcdn.co/wp-content/uploads/2023/03/pet-supply-retail-feature-image-1136x480.png",
  },
];

export default function CategoryShowcase() {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [sendingEnquiry, setSendingEnquiry] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllCategoryProducts();
  }, []);

  const fetchAllCategoryProducts = async () => {
    setLoading(true);
    try {
      const promises = categoriesData.map(async (category) => {
        try {
          const res = await axios.get(`${API_BASE_URL}/products?category=${category.slug}`);
          return { slug: category.slug, products: res.data };
        } catch (err) {
          console.error(`Error fetching ${category.slug}:`, err);
          return { slug: category.slug, products: [] };
        }
      });

      const results = await Promise.all(promises);
      const productsMap = {};
      results.forEach(({ slug, products }) => {
        productsMap[slug] = products;
      });

      setCategoryProducts(productsMap);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendEnquiry = async (product) => {
    if (!isSignedIn) {
      alert("Please login first");
      return;
    }
    if (user?.unsafeMetadata?.role !== "buyer") {
      alert("Only Buyers can send enquiries");
      return;
    }

    setSendingEnquiry(product._id);

    try {
      const token = await getToken();
      await axios.post(
        `${API_BASE_URL}/enquiries`,
        {
          productId: product._id,
          message: `I am interested in ${product.name}. Please share more details and best price.`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Enquiry sent successfully for ${product.name}!`);
    } catch (err) {
      console.error("Enquiry Error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to send enquiry.");
    } finally {
      setSendingEnquiry(null);
    }
  };

  const handleViewAll = (slug) => {
    navigate(`/category/${slug}`);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12 bg-gray-50/50">
      {/* Header - Same */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2">
          <TrendingUp className="w-4 h-4" />
          Global Wholesale Marketplace
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Industrial Categories
            </h2>
            <p className="mt-2 text-base text-slate-600 max-w-xl">
              Source directly from verified manufacturers and global suppliers.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-16">
        {categoriesData.map((category) => {
          const products = categoryProducts[category.slug] || [];

          return (
            <motion.section
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="scroll-mt-16"
            >
              {/* Category Hero - Same */}
              <div className="relative h-[260px] md:h-[300px] rounded-2xl overflow-hidden shadow-md mb-8 group">
                <img src={category.image} alt={category.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-transparent" />

                <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end">
                  <div className="max-w-lg">
                    <span className="inline-block px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full mb-3">
                      {products.length} Products
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                      {category.name}
                    </h3>
                    <p className="text-slate-200 text-sm md:text-base line-clamp-2 mb-4">
                      {category.desc}
                    </p>
                    <button 
                      onClick={() => handleViewAll(category.slug)}
                      className="flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-600 hover:text-white transition-all shadow"
                    >
                      Explore Category <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Cards with Seller Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.length > 0 ? (
                  products.slice(0, 5).map((product, i) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/60 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
                    >
                      <div className="relative aspect-square overflow-hidden bg-slate-100">
                        <img
                          src={product.images?.[0] || "https://picsum.photos/id/20/600/400"}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 text-amber-500 fill-current" />
                          4.5
                        </div>
                      </div>

                      <div className="p-3 flex flex-col flex-grow">
                        <div className="flex items-center gap-1 mb-1.5 text-[10px] font-medium text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </div>

                        <h5 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-1.5 group-hover:text-emerald-600 transition-colors leading-tight">
                          {product.name}
                        </h5>

                        {/* Seller Information - NEW */}
                        <div className="text-[10px] text-slate-500 mb-2">
                          by <span className="font-medium text-slate-700">
                            {product.sellerCompany || product.sellerName || "Unknown Supplier"}
                          </span>
                        </div>

                        {product.description && (
                          <p className="text-xs text-slate-600 line-clamp-1 mb-2">
                            {product.description}
                          </p>
                        )}

                        <div className="mt-auto pt-2.5 border-t border-slate-100">
                          <div className="mb-2">
                            <span className="text-[10px] text-slate-500">Price</span>
                            <div className="text-base font-bold text-slate-900">
                              ₹{product.price?.toLocaleString("en-IN")}
                              <span className="text-xs font-normal text-slate-400 ml-1">/unit</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <div className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                              MOQ: {product.moq}
                            </div>

                            <button
                              onClick={() => sendEnquiry(product)}
                              disabled={sendingEnquiry === product._id}
                              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              {sendingEnquiry === product._id ? "..." : "Enquire"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-slate-500 text-sm">
                    No products available in this category yet.
                  </div>
                )}
              </div>

              {products.length > 5 && (
                <div className="text-center mt-6">
                  <button 
                    onClick={() => handleViewAll(category.slug)}
                    className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 mx-auto text-sm transition-colors"
                  >
                    View All {products.length} Products in {category.name}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}