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
        // Every colour you listed: name shown on the site + hex for the round dot
        $c = [
            'black'  => ['name' => 'Black',      'hex' => '#1a1a1f'], 'grey'   => ['name' => 'Grey',       'hex' => '#9a9ea8'],
            'dgrey'  => ['name' => 'Dark Grey',  'hex' => '#3a3d45'], 'white'  => ['name' => 'White',      'hex' => '#f2f2f0'],
            'dblue'  => ['name' => 'Dark Blue',  'hex' => '#14305f'], 'lblue'  => ['name' => 'Light Blue', 'hex' => '#8ec5f0'],
            'blue'   => ['name' => 'Blue',       'hex' => '#2f6fed'], 'teal'   => ['name' => 'Teal',       'hex' => '#1f9e9a'],
            'dteal'  => ['name' => 'Dark Teal',  'hex' => '#0f5f5c'], 'purple' => ['name' => 'Purple',     'hex' => '#7b4fb0'],
            'pink'   => ['name' => 'Pink',       'hex' => '#e88fb0'], 'green'  => ['name' => 'Green',      'hex' => '#4caf6a'],
            'lgreen' => ['name' => 'Light Green', 'hex' => '#a8d8a0'], 'dgreen' => ['name' => 'Dark Green', 'hex' => '#2f4f3e'],
            'yellow' => ['name' => 'Yellow',     'hex' => '#f2c230'], 'red'    => ['name' => 'Red',        'hex' => '#c8352f'],
            'brown'  => ['name' => 'Brown',      'hex' => '#7a5c4a'], 'dbrown' => ['name' => 'Dark Brown', 'hex' => '#4a3426'],
        ];

        // Two-tone colour (e.g. Yellow / Black): name has both, hex = main, hex2 = second colour
        $two = fn (string $a, string $b) => [
            'name' => $c[$a]['name'] . ' / ' . $c[$b]['name'], 'hex' => $c[$a]['hex'], 'hex2' => $c[$b]['hex'],
        ];

        // Shortcut: turn a list of colour keys into colour entries
        $col = fn (string ...$keys) => array_map(fn ($k) => $c[$k], $keys);

        // Shared size lists
        $ws = ['XS', 'S', 'M', 'L', 'XL'];          // women's clothing
        $ms = ['S', 'M', 'L', 'XL', 'XXL'];         // men's clothing
        $gl = ['S', 'M', 'L', 'XL'];                // gloves
        $sk = ['S/M', 'L/XL'];                      // socks
        $one = ['One size'];
        $note = ' (sample: confirm your exact fabric)'; // reminder to replace with real details

        // Old photos named product-N.jpg still work: slug => N
        $legacy = [
            'core-seamless-leggings' => 1, 'sculpt-sports-bra' => 2, 'pump-cover-tee' => 3,
            'flex-training-shorts' => 4, 'aura-flex-shorts' => 5, 'tempo-joggers' => 6,
            'gym-duffel' => 7, 'hydra-steel-bottle' => 8, 'power-resistance-bands' => 9,
        ];

        // Finds photos in the frontend folder: slug.jpg, then slug-2.jpg, slug-3.jpg ... (extra gallery photos)
        $photos = function (string $slug) use ($legacy): array {
            $dir = base_path('../frontend/public/products/');
            $found = [];
            if (file_exists($dir . "$slug.jpg")) {
                $found[] = "/products/$slug.jpg";
            } elseif (isset($legacy[$slug]) && file_exists($dir . "product-{$legacy[$slug]}.jpg")) {
                $found[] = "/products/product-{$legacy[$slug]}.jpg"; // old naming
            }
            for ($i = 2; $i <= 6; $i++) {
                if (file_exists($dir . "$slug-$i.jpg")) {
                    $found[] = "/products/$slug-$i.jpg";
                }
            }
            return $found ?: ['/products/placeholder.svg']; // nothing found: placeholder
        };

        // Each row: [category, name, price, badge, description, features, fabric, care, sizes, colours, soldOutSizes, sizeLabel]
        $rows = [
            // ================= WOMEN (12) =================
            ['Women', 'Core Seamless Leggings', 28000, 'New', 'High-waisted seamless leggings with a sculpting, squat-proof knit. Soft against the skin and light enough for Lagos heat.', ['High-rise, no-dig waistband', 'Squat-proof, opaque fabric', 'Seamless for zero chafing', 'Hidden pocket at the waistband'], 'Nylon and elastane blend' . $note, 'Machine wash cold with similar colors. Do not use fabric softener. Air dry.', $ws, $col('grey', 'dgrey', 'purple', 'teal', 'black', 'dbrown'), ['XL']],
            ['Women', 'Flex Leggings', 25000, null, 'Stretchy, supportive leggings with a high waist for everyday training, yoga and errands.', ['High-rise waistband', 'Four-way stretch', 'Opaque, squat-proof fabric', 'Waistband pocket'], 'Nylon and elastane blend' . $note, 'Machine wash cold. Air dry.', $ws, $col('black', 'teal', 'dblue', 'lblue'), []],
            ['Women', 'Revive Longline Bra', 19500, 'New', 'A longline bra with extra coverage and a clean, flattering line. Great for lifting, pilates and everyday wear.', ['Longline coverage', 'Wide, comfy underband', 'Removable padding', 'Quick-dry fabric'], 'Nylon and elastane blend' . $note, 'Machine wash cold in a laundry bag. Do not tumble dry.', $ws, $col('white', 'black', 'purple', 'dblue', 'lblue', 'dgreen'), []],
            ['Women', 'Sculpt Sports Bra', 18000, 'Best Seller', 'A supportive, medium-impact sports bra with a smooth, sculpting fit. Holds firm through cardio and lifting while staying comfortable.', ['Medium support', 'Built-in removable cups', 'Racerback for free arm movement', 'Breathable, quick-dry fabric'], 'Nylon and elastane blend' . $note, 'Machine wash cold in a laundry bag. Do not tumble dry.', $ws, $col('grey', 'black', 'dblue', 'dgreen', 'teal'), []],
            ['Women', 'Crop Top', 13500, null, 'A fitted cropped top for training, yoga and everyday wear.', ['Cropped, flattering cut', 'Soft stretch fabric', 'Breathable', 'Flat, comfortable seams'], 'Cotton and elastane blend' . $note, 'Machine wash cold. Tumble dry low.', $ws, $col('pink', 'dblue', 'dgreen', 'lblue', 'purple', 'black', 'grey'), []],
            ['Women', 'Glide Crop Tank', 12500, null, 'A breathable cropped tank that layers over a bra or wears on its own through hot sessions.', ['Lightweight and airy', 'Cropped, flattering cut', 'Quick-dry fabric', 'Soft, flat seams'], 'Polyester and elastane blend' . $note, 'Machine wash cold. Air dry.', $ws, $col('pink', 'green', 'yellow', 'black', 'grey', 'white', 'dblue', 'dteal'), ['XS']],
            ['Women', 'Aura Flex Shorts', 14500, null, 'Smooth, high-waisted shorts that stay in place through squats, runs and studio classes.', ['High-rise waistband', 'Stay-put leg grip', 'Squat-proof fabric', 'Soft, buttery feel'], 'Nylon and elastane blend' . $note, 'Machine wash cold. Air dry.', $ws, $col('brown', 'black', 'grey', 'purple', 'dgreen'), []],
            ['Women', 'Breeze Training Shorts', 17000, null, 'Light training shorts with a soft waistband and a flattering fit for runs, classes and gym days.', ['Lightweight, quick-dry', 'Soft elastic waistband', 'Side pocket for your phone', 'Flattering cut'], 'Polyester and elastane blend' . $note, 'Machine wash cold. Air dry.', $ws, $col('black', 'grey', 'dblue', 'dbrown', 'dgrey'), []],
            ['Women', 'Contour Zip Jacket', 32000, 'New', 'A fitted zip jacket with thumbholes. Warm up in it, cool down in it, wear it out afterwards.', ['Thumbholes for warmth', 'Full-length zip', 'Two zip pockets', 'Smooth stretch fabric'], 'Polyester and elastane blend' . $note, 'Machine wash cold. Do not iron.', $ws, $col('black', 'dblue', 'lblue', 'teal'), []],
            ['Women', 'Cloud Oversized Hoodie', 30000, null, 'A roomy, ultra-soft hoodie for the walk to the gym and the couch after it.', ['Oversized, relaxed fit', 'Brushed fleece inside', 'Kangaroo pocket', 'Adjustable drawcord hood'], 'Cotton and polyester fleece' . $note, 'Machine wash cold. Tumble dry low.', $gl, $col('black', 'grey', 'dblue', 'dgreen'), []],
            ['Women', 'Ribbed Bodysuit', 21000, null, 'A sleek ribbed bodysuit that holds its shape and layers under anything.', ['Ribbed, sculpting knit', 'Snap-close bottom', 'Scoop neckline', 'Stays put when you move'], 'Nylon and elastane blend' . $note, 'Machine wash cold. Air dry.', $ws, [$two('yellow', 'black'), $two('purple', 'black'), $two('pink', 'black'), $two('blue', 'white'), $two('yellow', 'white')], ['L']],
            ['Women', 'Performance Set', 38000, 'New', 'A matching two-piece set with a supportive top and high-waisted bottoms, ready to wear straight from the pack.', ['Matching top and bottoms', 'High-waisted fit', 'Squat-proof fabric', 'Supportive and soft'], 'Nylon and elastane blend' . $note, 'Machine wash cold in a laundry bag. Air dry.', $ws, [$two('pink', 'white'), $two('purple', 'black'), $two('lblue', 'black'), $two('grey', 'black'), $two('dgreen', 'white')], []],

            // ================= MEN (11) =================
            ['Men', 'Pump Cover Tee', 15000, null, 'A relaxed training tee with a cropped, boxy cut that shows off your work and stays out of the way on heavy sets.', ['Relaxed, boxy fit', 'Soft, breathable cotton blend', 'Reinforced shoulder seams', 'Tag-free neck for comfort'], 'Cotton and polyester blend' . $note, 'Machine wash cold. Tumble dry low.', $ms, $col('white', 'grey', 'black', 'lblue'), []],
            ['Men', 'Flex Training Shorts', 16500, 'New', 'Lightweight training shorts with four-way stretch, made for leg day, sprints and everything between.', ['Four-way stretch', 'Zip pocket for keys and cards', 'Quick-dry, lightweight fabric', 'Elastic drawcord waist'], 'Polyester and elastane blend' . $note, 'Machine wash cold. Do not iron.', $ms, $col('grey', 'dblue', 'dgreen', 'black'), ['S']],
            ['Men', 'Tempo Joggers', 22000, null, 'Tapered joggers that work in the gym and out of it. Soft, structured and comfortable all day.', ['Tapered leg with ankle cuffs', 'Two zip pockets', 'Brushed inside for softness', 'Adjustable drawcord'], 'Cotton and polyester blend' . $note, 'Machine wash cold. Tumble dry low.', $ms, $col('black', 'grey', 'brown'), []],
            ['Men', 'Apex Compression Tee', 16000, 'New', 'A close-fit compression tee that supports the muscle and moves with every rep.', ['Compression fit', 'Moisture-wicking', 'Flatlock seams', 'Anti-odour finish'], 'Polyester and elastane blend' . $note, 'Machine wash cold. Air dry.', $ms, $col('black', 'teal', 'grey', 'white', 'purple', 'lblue', 'dblue'), []],
            ['Men', 'Jogger Pant', 21000, null, 'Slim, stretchy jogger pants with zip pockets, comfortable for training and travel.', ['Slim, tapered fit', 'Zip pockets', 'Four-way stretch', 'Elastic cuffs'], 'Polyester and elastane blend' . $note, 'Machine wash cold. Tumble dry low.', $ms, $col('black', 'dgreen', 'dblue', 'grey'), []],
            ['Men', 'Elite Pant', 26000, null, 'Straight-leg training pants with a clean look that works from the gym to the street.', ['Straight, clean leg', 'Zip pockets', 'Lightweight stretch fabric', 'Drawcord waist'], 'Polyester and elastane blend' . $note, 'Machine wash cold. Do not iron.', $ms, $col('black', 'grey', 'dblue'), []],
            ['Men', 'Anchor Long-Sleeve Tee', 17500, null, 'A soft long-sleeve tee for cool mornings, warm-ups and relaxed days.', ['Soft cotton blend', 'Regular fit', 'Thumb-friendly cuffs', 'Tag-free neck'], 'Cotton and polyester blend' . $note, 'Machine wash cold. Tumble dry low.', $ms, $col('white', 'grey', 'lblue', 'dblue', 'teal'), []],
            ['Men', 'Gridlock Track Jacket', 34000, null, 'A sharp zip track jacket for warm-ups, travel days and the walk home.', ['Full-length zip', 'Two zip pockets', 'Stand-up collar', 'Stretch fabric'], 'Polyester and elastane blend' . $note, 'Machine wash cold. Do not iron.', $ms, $col('brown', 'grey', 'black', 'lblue', 'dgreen'), []],
            ['Men', 'Rally Training Tank', 11500, null, 'A lightweight tank with deep armholes for full shoulder movement and maximum airflow.', ['Deep armholes', 'Ultra-light fabric', 'Quick-dry', 'Soft, tag-free neck'], 'Polyester mesh blend' . $note, 'Machine wash cold. Air dry.', $ms, $col('blue', 'white', 'black', 'grey', 'dblue'), []],
            ['Men', 'Compression Top', 17500, null, 'A long-sleeve compression top that supports the muscle and keeps you warm through warm-ups.', ['Long sleeves', 'Compression fit', 'Moisture-wicking', 'Flatlock seams'], 'Polyester and elastane blend' . $note, 'Machine wash cold. Air dry.', $ms, $col('black', 'grey', 'white', 'dblue'), []],
            ['Men', 'Surge Pullover Hoodie', 31000, 'Best Seller', 'A heavyweight hoodie with a clean, structured fit. Built for cold mornings and long days.', ['Heavyweight brushed fleece', 'Structured hood', 'Kangaroo pocket', 'Ribbed cuffs and hem'], 'Cotton and polyester fleece' . $note, 'Machine wash cold. Tumble dry low.', $ms, $col('black', 'dgreen', 'grey', 'brown'), []],

            // ================= ACCESSORIES (12) =================
            ['Accessories', 'Pulse Sport Cap', 8500, null, 'A light, breathable cap that keeps sun and sweat out of your eyes.', ['Lightweight, breathable', 'Moisture-wicking sweatband', 'Adjustable strap', 'Curved brim'], 'Polyester (sample: confirm your exact fabric)', 'Hand wash cold. Air dry.', $one, $col('black', 'grey', 'white'), []],
            ['Accessories', 'Grip Lifting Straps', 7500, null, 'Padded lifting straps that lock your grip so your back and legs do the work.', ['Padded wrist section', 'Non-slip stitched grip', 'Fits most wrists', 'Sold as a pair'], 'Cotton webbing with neoprene padding (sample: confirm)', 'Hand wash. Air dry.', $one, $col('black', 'dblue', 'grey'), []],
            ['Accessories', 'Water Bottle', 8000, null, 'A lightweight everyday water bottle with a carry handle and a leak-proof lid, for the gym, the office and the car.', ['Leak-proof lid', 'Carry handle', 'Easy-sip spout', 'BPA-free'], 'BPA-free plastic (sample: confirm your exact material)', 'Hand wash or top-rack dishwasher.', ['750ml', '1L'], $col('grey', 'teal', 'purple'), [], 'Capacity'],
            ['Accessories', 'Hydra Steel Bottle', 9000, null, 'An insulated steel bottle that keeps drinks cold through your whole session and the ride home.', ['Double-wall insulation', 'Leak-proof lid', 'Fits most cup holders', 'Wide mouth for ice'], 'Stainless steel (sample: confirm your exact material)', 'Hand wash. Not dishwasher safe.', ['500ml', '750ml'], $col('black', 'lblue', 'brown'), [], 'Capacity'],
            ['Accessories', 'Gym Duffel', 25000, 'New', 'A roomy duffel with a separate shoe compartment, sized for a full session and a quick change afterwards.', ['Ventilated shoe compartment', 'Water-resistant base', 'Padded shoulder strap', 'Zip side pocket'], 'Water-resistant polyester (sample: confirm your exact material)', 'Spot clean with a damp cloth.', $one, $col('black', 'grey', 'brown'), []],
            ['Accessories', 'Stride Crew Socks', 6000, null, 'Cushioned crew socks with arch support that stay up through every session.', ['Cushioned sole', 'Arch support band', 'Breathable mesh top', 'Pack of three pairs'], 'Cotton and nylon blend (sample: confirm your exact fabric)', 'Machine wash warm. Tumble dry low.', $sk, $col('white', 'grey', 'lblue', 'teal', 'black'), []],
            ['Accessories', 'Performance Socks', 6500, null, 'Lightweight performance socks with a snug fit and breathable mesh, made for running and training.', ['Breathable mesh zones', 'Snug arch support', 'Seamless toe', 'Moisture-wicking'], 'Polyester, nylon and elastane blend (sample: confirm)', 'Machine wash warm. Tumble dry low.', $sk, $col('white', 'lgreen', 'pink', 'black', 'teal', 'lblue'), []],
            ['Accessories', 'Power Resistance Bands', 12000, null, 'A set of looped resistance bands for glute work, warm-ups and travel workouts.', ['Non-slip fabric finish', "Doesn't roll up during use", 'Three resistance levels', 'Comes with a carry pouch'], 'Fabric-covered latex (sample: confirm your exact material)', 'Wipe clean. Air dry away from direct sunlight.', ['Light', 'Medium', 'Heavy'], $col('green', 'blue', 'red', 'purple', 'yellow'), [], 'Resistance'],
            ['Accessories', 'Grip Gloves', 9500, null, 'Padded grip gloves that protect your palms and keep the bar from slipping.', ['Padded palm', 'Non-slip grip surface', 'Breathable back', 'Adjustable wrist strap'], 'Synthetic leather and mesh (sample: confirm your exact material)', 'Hand wash. Air dry.', $gl, $col('dgreen', 'black', 'brown'), []],
            ['Accessories', 'Lift Gloves', 10500, null, 'Lightweight lifting gloves with wrist support for heavy sets and long sessions.', ['Wrist support wrap', 'Silicone-grip palm', 'Ventilated fingers', 'Pull-on loop'], 'Synthetic leather and mesh (sample: confirm your exact material)', 'Hand wash. Air dry.', $gl, $col('black', 'dteal', 'brown'), []],
            ['Accessories', 'Trail Gym Backpack', 29000, 'New', 'A structured backpack with a laptop sleeve and a ventilated shoe pocket, built for gym then work.', ['Padded laptop sleeve', 'Ventilated shoe pocket', 'Water-resistant fabric', 'Padded back and straps'], 'Water-resistant polyester (sample: confirm your exact material)', 'Spot clean with a damp cloth.', $one, $col('grey', 'black'), []],
            ['Accessories', 'Speed Jump Rope', 5500, null, 'A fast, tangle-free rope with ball-bearing handles for cardio, boxing and warm-ups.', ['Ball-bearing handles', 'Adjustable length', 'Non-slip grip', 'Tangle-free cable'], 'Steel cable with PVC coat (sample: confirm your exact material)', 'Wipe clean.', $one, $col('blue', 'black', 'grey', 'brown'), []],
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
                'images' => $photos($slug),            // real photos if present, else placeholder
                'is_featured' => in_array($slug, $featured),
            ]);
        }
    }
}
