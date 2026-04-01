import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, Star, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { useUser, useAuth } from "@clerk/clerk-react";

// Import categoriesData from CategoryShowcase
import { categoriesData } from "../Component/CategoryShowcase";   // ← Yeh line important hai

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "http://localhost:5000/api";

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingEnquiry, setSendingEnquiry] = useState(null);

  useEffect(() => {
    fetchCategoryData();
  }, [slug]);

  const fetchCategoryData = async () => {
    setLoading(true);

    try {
      // Find category details from categoriesData
      const foundCategory = categoriesData.find(cat => cat.slug === slug);
      
      if (!foundCategory) {
        console.error("Category not found for slug:", slug);
        setCategory(null);
        setLoading(false);
        return;
      }

      setCategory(foundCategory);

      // Fetch products
      const res = await axios.get(`${API_BASE_URL}/products?category=${slug}`);
      setProducts(res.data || []);
      
    } catch (err) {
      console.error("Error fetching category products:", err);
      setProducts([]);
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
    
    const res = await axios.post(
      `${API_BASE_URL}/enquiries`,
      {
        productId: product._id,
        message: `I am interested in ${product.name}. Please share more details and best price.`,
      },
      { 
        headers: { 
          Authorization: `Bearer ${token}` 
        } 
      }
    );

    alert(`Enquiry sent successfully for ${product.name}!`);
  } catch (err) {
    console.error("Enquiry Error:", err.response?.data || err.message);
    alert(err.response?.data?.error || "Failed to send enquiry. Please try again.");
  } finally {
    setSendingEnquiry(null);
  }
};

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Category Not Found
  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Category Not Found</h2>
          <p className="text-slate-600 mb-6">The category you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to All Categories
        </button>

        {/* Category Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">{category.name}</h1>
          <p className="text-lg text-slate-600 max-w-3xl">{category.desc}</p>
          <div className="mt-4 inline-block px-4 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
            {products.length} Products Available
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {products.length > 0 ? (
            products.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 hover:shadow-xl transition-all overflow-hidden flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={product.images?.[0] || "https://picsum.photos/id/20/600/400"}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-current" /> 4.5
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex items-center gap-1.5 mb-2 text-emerald-600 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified Supplier
                  </div>

                  <h3 className="font-semibold text-slate-800 line-clamp-2 mb-3 leading-tight">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-auto border-t pt-4">
                    <div className="mb-3">
                      <span className="text-xs text-slate-500">Bulk Price</span>
                      <div className="text-2xl font-bold text-slate-900">
                        ₹{product.price?.toLocaleString("en-IN")}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-xs bg-slate-100 px-3 py-2 rounded-lg font-medium text-slate-700">
                        MOQ: {product.moq}
                      </div>
                      <button
                        onClick={() => sendEnquiry(product)}
                        disabled={sendingEnquiry === product._id}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {sendingEnquiry === product._id ? "Sending..." : "Enquire"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-slate-500 text-lg">
              No products found in this category yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}