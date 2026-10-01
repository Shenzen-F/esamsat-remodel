const fs = require('fs');
const path = 'frontend/src/components/info/InfoSection.vue';
let data = fs.readFileSync(path, 'utf8');

// Replace imports
data = data.replace(
  /import \{ MapPin, Calendar, HelpCircle, Mail, Car, Building \} from '@lucide\/vue'/,
  `import { MapPin, Calendar, HelpCircle, Mail, Car, Building, Search, X } from '@lucide/vue'`
);

// Replace filteredLocations
const computedTarget = /const filteredLocations = computed\(\(\) => \{\s+return locations\.value\.filter\(loc => loc\.type === activeFilter\.value\)\s+\}\)/;
data = data.replace(
  computedTarget,
  `const searchQuery = ref('')
const isSearchActive = ref(false)

const closeSearch = () => {
  isSearchActive.value = false
  searchQuery.value = ''
}

const filteredLocations = computed(() => {
  if (isSearchActive.value && searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase()
    return locations.value.filter(loc => 
      (loc.name && loc.name.toLowerCase().includes(query)) || 
      (loc.address && loc.address.toLowerCase().includes(query))
    )
  }
  return locations.value.filter(loc => loc.type === activeFilter.value)
})`
);

// Replace template block
const templateStartStr = `<div style="display: flex; justify-content: center; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap;">`;
const templateBlockRegex = /<div style="display: flex; justify-content: center; gap: 0\.75rem; margin-bottom: 2rem; flex-wrap: wrap;">[\s\S]*?<\/button>\s*<\/div>/;

const htmlReplacement = `      <div style="position: relative; width: 100%; max-width: 800px; margin: 0 auto 2rem; overflow: hidden; min-height: 45px; display: flex; align-items: center; justify-content: center;">
        
        <!-- Filter Buttons Container -->
        <div 
          style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease; width: 100%;"
          :style="{
            transform: isSearchActive ? 'translateX(-100%)' : 'translateX(0)',
            opacity: isSearchActive ? '0' : '1',
            position: isSearchActive ? 'absolute' : 'relative',
            pointerEvents: isSearchActive ? 'none' : 'auto'
          }"
        >
          <button 
            v-for="filter in filters" 
            :key="filter"
            @click="activeFilter = filter"
            :style="{
              padding: '0.6rem 1.25rem',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              backgroundColor: activeFilter === filter ? '#38bdf8' : 'rgba(255,255,255,0.1)',
              color: activeFilter === filter ? '#0f172a' : '#ffffff',
              boxShadow: activeFilter === filter ? '0 4px 12px rgba(56, 189, 248, 0.4)' : 'none'
            }"
          >
            {{ filter }}
          </button>
          
          <!-- Tombol Search Toggle -->
          <button 
            @click="isSearchActive = true"
            style="padding: 0.6rem; border-radius: 50%; border: none; cursor: pointer; transition: all 0.3s ease; background-color: rgba(255,255,255,0.1); color: #ffffff; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;"
            title="Cari Lokasi"
          >
            <Search :size="18" />
          </button>
        </div>

        <!-- Search Input Container -->
        <div 
          style="display: flex; align-items: center; width: 100%; max-width: 500px; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;"
          :style="{
            transform: isSearchActive ? 'translateX(0)' : 'translateX(100%)',
            opacity: isSearchActive ? '1' : '0',
            position: isSearchActive ? 'absolute' : 'relative',
            pointerEvents: isSearchActive ? 'auto' : 'none'
          }"
        >
          <div style="position: relative; width: 100%; display: flex; align-items: center;">
            <Search :size="18" style="position: absolute; left: 1rem; color: #94a3b8; z-index: 10;" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Cari nama lokasi atau alamat..." 
              style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.75rem; border-radius: 24px; border: none; outline: none; font-size: 0.95rem; background: #ffffff; color: #0f172a; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
            />
            <button 
              @click="closeSearch" 
              style="position: absolute; right: 0.5rem; background: none; border: none; cursor: pointer; color: #64748b; padding: 0.25rem; display: flex; align-items: center; border-radius: 50%; transition: background-color 0.2s; z-index: 10;"
            >
              <X :size="20" />
            </button>
          </div>
        </div>
      </div>`;

data = data.replace(templateBlockRegex, htmlReplacement);

fs.writeFileSync(path, data);
console.log('Update complete');
