<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Every colour used in the catalogue: name shown on the site + hex for the round dot.
        // The photo file name uses the slug of the name: "Dark Blue" -> dark-blue
        $c = [
            'black'    => ['name' => 'Black',      'hex' => '#1a1a1f'], 'grey'   => ['name' => 'Grey',        'hex' => '#9a9ea8'],
            'dgrey'    => ['name' => 'Dark Grey',  'hex' => '#3a3d45'], 'white'  => ['name' => 'White',       'hex' => '#f2f2f0'],
            'dblue'    => ['name' => 'Dark Blue',  'hex' => '#14305f'], 'lblue'  => ['name' => 'Light Blue',  'hex' => '#8ec5f0'],
            'blue'     => ['name' => 'Blue',       'hex' => '#2f6fed'], 'teal'   => ['name' => 'Teal',        'hex' => '#1f9e9a'],
            'purple'   => ['name' => 'Purple',     'hex' => '#7b4fb0'], 'pink'   => ['name' => 'Pink',        'hex' => '#e88fb0'],
            'lgreen'   => ['name' => 'Light Green', 'hex' => '#a8d8a0'], 'dgreen' => ['name' => 'Dark Green',  'hex' => '#2f4f3e'],
            'brown'    => ['name' => 'Brown',      'hex' => '#7a5c4a'],
            'assorted' => ['name' => 'Assorted',   'hex' => '#9a9ea8'], // placeholder for items sold as a mixed set
        ];

        // Shortcut: turn a list of colour keys into colour entries
        $col = fn (string ...$keys) => array_map(fn ($k) => $c[$k], $keys);

        // Shared size lists
        $ws = ['XS', 'S', 'M', 'L', 'XL'];          // women's clothing
        $ms = ['S', 'M', 'L', 'XL', 'XXL'];         // men's clothing
        $gl = ['S', 'M', 'L', 'XL'];                // gloves and hoodies
        $sk = ['S/M', 'L/XL'];                      // socks
        $one = ['One size'];
        $note = ' (sample: confirm your exact fabric)'; // reminder to replace with real details

        // Each row: [category, name, price, badge, description, features, fabric, care, sizes, colours, soldOutSizes, sizeLabel]
        $rows = [
            // ================= WOMEN (12) =================
            ['Women', 'Core Seamless Leggings', 28000, 'New', 'High-waisted seamless leggings with a sculpting, squat-proof knit. Soft against the skin and light enough for Lagos heat.', ['High-rise, no-dig waistband', 'Squat-proof, opaque fabric', 'Seamless for zero chafing', 'Hidden pocket at the waistband'], 'Nylon and elastane blend' . $note, 'Machine wash cold with similar colors. Do not use fabric softener. Air dry.', $ws, $col('black', 'dgrey', 'grey', 'purple', 'teal', 'brown'), ['XL']],
            ['Women', 'Flex Leggings', 25000, null, 'Stretchy, supportive leggings with a high waist for everyday training, yoga and errands.', ['High-rise waistband', 'Four-way stretch', 'Opaque, squat-proof fabric', 'Waistband pocket'], 'Nylon and elastane blend' . $note, 'Machine wash cold. Air dry.', $ws, $col('black', 'dblue', 'teal', 'lblue'), []],
            ['Women', 'Revive Longline Bra', 19500, 'New', 'A longline bra with extra coverage and a clean, flattering line. Great for lifting, pilates and everyday wear.', ['Longline coverage', 'Wide, comfy underband', 'Removable padding', 'Quick-dry fabric'], 'Nylon and elastane blend' . $note, 'Machine wash cold in a laundry bag. Do not tumble dry.', $ws, $col('black', 'purple', 'dblue', 'lblue', 'dgreen'), []],
            ['Women', 'Sculpt Sports Bra', 18000, 'Best Seller', 'A supportive, medium-impact sports bra with a smooth, sculpting fit. Holds firm through cardio and lifting while staying comfortable.', ['Medium support', 'Built-in removable cups', 'Racerback for free arm movement', 'Breathable, quick-dry fabric'], 'Nylon and elastane blend' . $note, 'Machine wash cold in a laundry bag. Do not tumble dry.', $ws, $col('black', 'blue', 'teal', 'grey', 'dgreen'), []],
            ['Women', 'Flex Armless Top', 13500, null, 'A fitted armless top with a soft stretch for training, yoga and everyday wear.', ['Armless, free-moving cut', 'Soft four-way stretch', 'Breathable fabric', 'Flat, comfortable seams'], 'Nylon and elastane blend' . $note, 'Machine wash cold. Air dry.', $ws, $col('black', 'pink', 'blue', 'lblue', 'grey', 'purple', 'teal'), []],
            ['Women', 'Glide Crop Tank', 12500, null, 'A breathable cropped tank that layers over a bra or wears on its own through hot sessions.', ['Lightweight and airy', 'Cropped, flattering cut', 'Quick-dry fabric', 'Soft, flat seams'], 'Polyester and elastane blend' . $note, 'Machine wash cold. Air dry.', $ws, $col('grey', 'lgreen', 'teal', 'black', 'dblue', 'pink'), ['XS']],
            ['Women', 'Aura Flex Shorts', 14500, null, 'Smooth, high-waisted shorts that stay in place through squats, runs and studio classes.', ['High-rise waistband', 'Stay-put leg grip', 'Squat-proof fabric', 'Soft, buttery feel'], 'Nylon and elastane blend' . $note, 'Machine wash cold. Air dry.', $ws, $col('black', 'dblue', 'brown', 'purple', 'grey', 'dgreen'), []],
            ['Women', 'Breeze Training Shorts', 17000, null, 'Light training shorts with a soft waistband and a flattering fit for runs, classes and gym days.', ['Lightweight, quick-dry', 'Soft elastic waistband', 'Side pocket for your phone', 'Flattering cut'], 'Polyester and elastane blend' . $note, 'Machine wash cold. Air dry.', $ws, $col('black', 'grey', 'dblue', 'dgreen', 'purple', 'brown'), []],
            ['Women', 'Contour Zip Jacket', 32000, 'New', 'A fitted zip jacket with thumbholes. Warm up in it, cool down in it, wear it out afterwards.', ['Thumbholes for warmth', 'Full-length zip', 'Two zip pockets', 'Smooth stretch fabric'], 'Polyester and elastane blend' . $note, 'Machine wash cold. Do not iron.', $ws, $col('black', 'dblue', 'lblue', 'grey', 'teal'), []],
            ['Women', 'Performance Set', 38000, null, 'A matching two-piece set with a supportive top and high-waisted bottoms, ready to wear straight from the pack.', ['Matching top and bottoms', 'High-waisted fit', 'Squat-proof fabric', 'Supportive and soft'], 'Nylon and elastane blend' . $note, 'Machine wash cold in a laundry bag. Air dry.', $ws, $col('black', 'grey', 'dblue'), []],
            ['Women', 'Aura Flex Performance Set', 40000, 'New', 'The Aura Flex top and shorts as a matching set: smooth, stretchy and made to move together.', ['Matching top and shorts', 'High-rise waistband', 'Squat-proof, buttery fabric', 'Supportive and soft'], 'Nylon and elastane blend' . $note, 'Machine wash cold in a laundry bag. Air dry.', $ws, $col('black', 'lblue', 'teal', 'purple'), []],
            ['Women', 'Cloud Oversized Hoodie', 30000, null, 'A roomy, ultra-soft hoodie for the walk to the gym and the couch after it.', ['Oversized, relaxed fit', 'Brushed fleece inside', 'Kangaroo pocket', 'Adjustable drawcord hood'], 'Cotton and polyester fleece' . $note, 'Machine wash cold. Tumble dry low.', $gl, $col('black', 'dblue', 'dgreen', 'brown', 'grey'), []],

            // ================= ACCESSORIES (9) =================
            ['Accessories', 'Pulse Sport Cap', 8500, null, 'A light, breathable cap that keeps sun and sweat out of your eyes.', ['Lightweight, breathable', 'Moisture-wicking sweatband', 'Adjustable strap', 'Curved brim'], 'Polyester (sample: confirm your exact fabric)', 'Hand wash cold. Air dry.', $one, $col('black', 'white', 'dblue', 'grey'), []],
            ['Accessories', 'Grip Lifting Straps', 7500, null, 'Padded lifting straps that lock your grip so your back and legs do the work.', ['Padded wrist section', 'Non-slip stitched grip', 'Fits most wrists', 'Sold as a pair'], 'Cotton webbing with neoprene padding (sample: confirm)', 'Hand wash. Air dry.', $one, $col('black', 'brown', 'grey'), []],
            ['Accessories', 'Water Bottle', 8000, null, 'A lightweight everyday water bottle with a carry handle and a leak-proof lid, for the gym, the office and the car.', ['Leak-proof lid', 'Carry handle', 'Easy-sip spout', 'BPA-free'], 'BPA-free plastic (sample: confirm your exact material)', 'Hand wash or top-rack dishwasher.', ['750ml', '1L'], $col('black', 'brown', 'grey'), [], 'Capacity'],
            ['Accessories', 'Hydra Steel Bottle', 9000, null, 'An insulated steel bottle that keeps drinks cold through your whole session and the ride home.', ['Double-wall insulation', 'Leak-proof lid', 'Fits most cup holders', 'Wide mouth for ice'], 'Stainless steel (sample: confirm your exact material)', 'Hand wash. Not dishwasher safe.', ['500ml', '750ml'], $col('black', 'grey'), [], 'Capacity'],
            ['Accessories', 'Gym Duffel', 25000, 'New', 'A roomy duffel with a separate shoe compartment, sized for a full session and a quick change afterwards.', ['Ventilated shoe compartment', 'Water-resistant base', 'Padded shoulder strap', 'Zip side pocket'], 'Water-resistant polyester (sample: confirm your exact material)', 'Spot clean with a damp cloth.', $one, $col('black', 'brown', 'grey'), []],
            ['Accessories', 'Stride Crew Socks', 6000, null, 'Cushioned crew socks with arch support that stay up through every session.', ['Cushioned sole', 'Arch support band', 'Breathable mesh top', 'Pack of three pairs'], 'Cotton and nylon blend (sample: confirm your exact fabric)', 'Machine wash warm. Tumble dry low.', $sk, $col('black', 'white', 'dblue', 'brown'), []],
            ['Accessories', 'Performance Socks', 6500, null, 'Lightweight performance socks with a snug fit and breathable mesh, made for running and training.', ['Breathable mesh zones', 'Snug arch support', 'Seamless toe', 'Moisture-wicking'], 'Polyester, nylon and elastane blend (sample: confirm)', 'Machine wash warm. Tumble dry low.', $sk, $col('black', 'brown', 'dgreen', 'white'), []],
            ['Accessories', 'Power Resistance Bands', 12000, null, 'A set of looped resistance bands for glute work, warm-ups and travel workouts.', ['Non-slip fabric finish', "Doesn't roll up during use", 'Three resistance levels', 'Comes with a carry pouch'], 'Fabric-covered latex (sample: confirm your exact material)', 'Wipe clean. Air dry away from direct sunlight.', ['Light', 'Medium', 'Heavy'], $col('assorted'), [], 'Resistance'],
            ['Accessories', 'Grip Gloves', 9500, null, 'Padded grip gloves that protect your palms and keep the bar from slipping.', ['Padded palm', 'Non-slip grip surface', 'Breathable back', 'Adjustable wrist strap'], 'Synthetic leather and mesh (sample: confirm your exact material)', 'Hand wash. Air dry.', $gl, $col('black', 'brown', 'dblue', 'dgreen'), []],

            // ================= MEN (10) =================
            ['Men', 'Flex Training Shorts', 16500, 'New', 'Lightweight training shorts with four-way stretch, made for leg day, sprints and everything between.', ['Four-way stretch', 'Zip pocket for keys and cards', 'Quick-dry, lightweight fabric', 'Elastic drawcord waist'], 'Polyester and elastane blend' . $note, 'Machine wash cold. Do not iron.', $ms, $col('black', 'dgreen', 'dblue', 'grey'), ['S']],
            ['Men', 'Pump Cover Tee', 15000, null, 'A relaxed training tee with a cropped, boxy cut that shows off your work and stays out of the way on heavy sets.', ['Relaxed, boxy fit', 'Soft, breathable cotton blend', 'Reinforced shoulder seams', 'Tag-free neck for comfort'], 'Cotton and polyester blend' . $note, 'Machine wash cold. Tumble dry low.', $ms, $col('black', 'white', 'grey', 'lblue'), []],
            ['Men', 'Elite Pant', 26000, null, 'Straight-leg training pants with a clean look that works from the gym to the street.', ['Straight, clean leg', 'Zip pockets', 'Lightweight stretch fabric', 'Drawcord waist'], 'Polyester and elastane blend' . $note, 'Machine wash cold. Do not iron.', $ms, $col('grey', 'black', 'dblue'), []],
            ['Men', 'Tempo Joggers', 22000, null, 'Tapered joggers that work in the gym and out of it. Soft, structured and comfortable all day.', ['Tapered leg with ankle cuffs', 'Two zip pockets', 'Brushed inside for softness', 'Adjustable drawcord'], 'Cotton and polyester blend' . $note, 'Machine wash cold. Tumble dry low.', $ms, $col('black', 'grey', 'brown'), []],
            ['Men', 'Apex Active Tee', 16000, 'New', 'A close-fit active tee that supports the muscle and moves with every rep.', ['Athletic, close fit', 'Moisture-wicking', 'Flatlock seams', 'Anti-odour finish'], 'Polyester and elastane blend' . $note, 'Machine wash cold. Air dry.', $ms, $col('black', 'grey', 'white', 'purple', 'dblue', 'lblue'), []],
            ['Men', 'Anchor Long-Sleeve', 17500, null, 'A soft long-sleeve tee for cool mornings, warm-ups and relaxed days.', ['Soft cotton blend', 'Regular fit', 'Thumb-friendly cuffs', 'Tag-free neck'], 'Cotton and polyester blend' . $note, 'Machine wash cold. Tumble dry low.', $ms, $col('black', 'white', 'grey', 'teal', 'lblue', 'dblue'), []],
            ['Men', 'Gridlock Track Jacket', 34000, null, 'A sharp zip track jacket for warm-ups, travel days and the walk home.', ['Full-length zip', 'Two zip pockets', 'Stand-up collar', 'Stretch fabric'], 'Polyester and elastane blend' . $note, 'Machine wash cold. Do not iron.', $ms, $col('black', 'grey', 'brown', 'lblue', 'dgreen'), []],
            ['Men', 'Rally Training Tank', 11500, null, 'A lightweight tank with deep armholes for full shoulder movement and maximum airflow.', ['Deep armholes', 'Ultra-light fabric', 'Quick-dry', 'Soft, tag-free neck'], 'Polyester mesh blend' . $note, 'Machine wash cold. Air dry.', $ms, $col('black', 'dblue', 'grey', 'white'), []],
            ['Men', 'Performance Compression Shirt', 17500, null, 'A long-sleeve compression shirt that supports the muscle and keeps you warm through warm-ups.', ['Long sleeves', 'Compression fit', 'Moisture-wicking', 'Flatlock seams'], 'Polyester and elastane blend' . $note, 'Machine wash cold. Air dry.', $ms, $col('black', 'grey', 'white', 'dblue'), []],
            ['Men', 'Surge Pullover Hoodie', 31000, 'Best Seller', 'A heavyweight hoodie with a clean, structured fit. Built for cold mornings and long days.', ['Heavyweight brushed fleece', 'Structured hood', 'Kangaroo pocket', 'Ribbed cuffs and hem'], 'Cotton and polyester fleece' . $note, 'Machine wash cold. Tumble dry low.', $ms, $col('black', 'dgreen', 'grey', 'brown'), []],
        ];

        $cat = Category::pluck('id', 'name'); // category name => id
        $featured = ['core-seamless-leggings', 'sculpt-sports-bra', 'pump-cover-tee', 'flex-training-shorts']; // shown in Featured Drops

        foreach ($rows as $r) {
            [$category, $name, $price, $badge, $desc, $features, $fabric, $care, $sizes, $colors] = $r;
            $soldOut = $r[10] ?? [];       // optional: sold-out sizes
            $label = $r[11] ?? 'Size';     // optional: label like "Capacity"
            $slug = Str::slug($name);      // "Core Seamless Leggings" -> "core-seamless-leggings"

            Product::updateOrCreate(['slug' => $slug], [  // re-runnable: matches by slug
                'category_id' => $cat[$category],
                'name' => $name,
                'price' => $price,
                'badge' => $badge,
                'description' => $desc,
                'features' => $features,
                'fabric' => $fabric,
                'care' => $care,
                'sizes' => $sizes,
                'size_label' => $label,
                'sold_out_sizes' => $soldOut,
                'colors' => $colors,
                'is_featured' => in_array($slug, $featured),
            ]);
        }
    }
}
