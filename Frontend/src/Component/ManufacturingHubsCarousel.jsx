// Optimized Manufacturing Hubs Carousel (Clean + Balanced UI)
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

// Reduced & focused data
const manufacturingHubs = [
  {
    city: "Delhi NCR",
    image: "https://images.unsplash.com/photo-1582139329536-e4c2c6c8b9e6",
    suppliers: "2.4K+",
    industries: ["Electronics", "Auto", "Apparel"],
    rating: 4.8
  },
  {
    city: "Mumbai",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523",
    suppliers: "3.8K+",
    industries: ["Pharma", "Textiles", "Packaging"],
    rating: 4.9
  },
  {
    city: "Ahmedabad",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a9c",
    suppliers: "5.1K+",
    industries: ["Textiles", "Chemicals", "Machinery"],
    rating: 4.7
  },
  {
    city: "Bengaluru",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
    suppliers: "2.9K+",
    industries: ["Electronics", "Aerospace", "IT"],
    rating: 4.8
  },
  {
    city: "Surat",
    image: "https://images.unsplash.com/photo-1571896349840-e26b311e650c",
    suppliers: "6.7K+",
    industries: ["Textiles", "Diamonds", "Apparel"],
    rating: 4.9
  }
];

export default function ManufacturingHubsCarousel() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Manufacturing Hubs
          </h2>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            Explore top industrial cities with verified suppliers across India
          </p>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          autoplay={{ delay: 3500 }}
          pagination={{ clickable: true }}
          loop
        >
          {manufacturingHubs.map((hub, i) => (
            <SwiperSlide key={i}>

              <motion.div
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all overflow-hidden"
              >

                {/* Image */}
                <div className="h-48 overflow-hidden">
                  <img
                    src={`${hub.image}?auto=format&fit=crop&w=600&q=80`}
                    alt={hub.city}
                    className="w-full h-full object-cover hover:scale-110 transition duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-5">

                  {/* City + Rating */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 font-semibold text-gray-800">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      {hub.city}
                    </div>
                    <div className="flex items-center text-sm text-amber-500">
                      <Star className="w-4 h-4 fill-amber-500" />
                      {hub.rating}
                    </div>
                  </div>

                  {/* Suppliers */}
                  <p className="text-sm text-gray-600 mb-3">
                    {hub.suppliers} Suppliers Available
                  </p>

                  {/* Industries */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hub.industries.map((item, j) => (
                      <span
                        key={j}
                        className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                    Explore
                    <ArrowRight className="w-4 h-4" />
                  </button>

                </div>

              </motion.div>

            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
