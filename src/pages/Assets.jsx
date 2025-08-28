
import React, { useState, useEffect } from "react";
import { Asset } from "@/api/entities";
import { Company } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload,
  Search,
  Grid,
  List,
  Image,
  FileText,
  Video,
  Download,
  FolderOpen,
  Folder,
  Plus,
  MoreHorizontal,
  Eye,
  Share2,
  Edit2,
  Trash2,
  ArrowLeft,
  Music,
  Archive,
  Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Loader from "../components/ui/Loader";

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("grid");
  const [filter, setFilter] = useState("all");
  const [ownershipFilter, setOwnershipFilter] = useState("all"); // New filter
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState("");
  const [currentCompany, setCurrentCompany] = useState(null);
  const [user, setUser] = useState(null);

  // Folder navigation
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);

  // Modals
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (currentCompany && user) {
      loadAssets();
    }
  }, [currentCompany, currentFolder, user, ownershipFilter]); // Added ownershipFilter to dependency array

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [userData, companiesData] = await Promise.all([User.me(), Company.list()]);
      setUser(userData);
      if (companiesData.length > 0) {
        setCurrentCompany(companiesData[0]);
      }
    } catch (error) {
      console.error("Failed to load initial data:", error);
    }
    setIsLoading(false);
  };

  const loadAssets = async () => {
    if (!currentCompany || !user) return;
    try {
      // Load assets based on ownership filter
      let assetsData;
      if (ownershipFilter === "my_files") {
        // Only show files uploaded by current user
        assetsData = await Asset.filter({
          company_id: currentCompany.id,
          parent_folder_id: currentFolder?.id || null,
          created_by: user.email
        }, "-created_date");
      } else {
        // Show all company files (default behavior)
        assetsData = await Asset.filter({
          company_id: currentCompany.id,
          parent_folder_id: currentFolder?.id || null
        }, "-created_date");
      }
      setAssets(assetsData);
    } catch (error) {
      console.error("Failed to load assets:", error);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0 || !currentCompany) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadingFileName(file.name);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));

        const { file_url } = await UploadFile({ file });
        const fileType = getFileType(file.type);

        await Asset.create({
          title: file.name,
          file_url: file_url,
          file_type: fileType,
          file_size: file.size,
          mime_type: file.type,
          tags: [],
          company_id: currentCompany.id,
          parent_folder_id: currentFolder?.id || null,
          created_by: user?.email, // Ensure created_by is set
        });
      }

      setUploadProgress(100);
      await loadAssets();
    } catch (error) {
      console.error("Failed to upload files:", error);
      alert(`Failed to upload files: ${error.message}`);
    }

    setIsUploading(false);
    setUploadProgress(0);
    setUploadingFileName("");

    // Reset the input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleFolderUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0 || !currentCompany) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Group files by their folder structure
      const folderStructure = {};

      files.forEach(file => {
        const pathParts = file.webkitRelativePath.split('/');
        const fileName = pathParts.pop();
        const folderPath = pathParts.join('/');

        if (!folderStructure[folderPath]) {
          folderStructure[folderPath] = [];
        }
        folderStructure[folderPath].push({ file, fileName });
      });

      const totalFiles = files.length;
      let uploadedFiles = 0;

      // Create folders and upload files
      for (const [folderPath, filesInFolder] of Object.entries(folderStructure)) {
        let currentParentId = currentFolder?.id || null;

        if (folderPath) {
          const pathParts = folderPath.split('/');

          for (const folderName of pathParts) {
            const existingFolders = await Asset.filter({
              company_id: currentCompany.id,
              parent_folder_id: currentParentId,
              title: folderName,
              file_type: 'folder'
            });

            if (existingFolders.length === 0) {
              const newFolder = await Asset.create({
                title: folderName,
                file_type: 'folder',
                company_id: currentCompany.id,
                parent_folder_id: currentParentId,
                created_by: user?.email, // Ensure created_by is set
              });
              currentParentId = newFolder.id;
            } else {
              currentParentId = existingFolders[0].id;
            }
          }
        }

        // Upload files to the created/found folder
        for (const { file, fileName } of filesInFolder) {
          setUploadingFileName(fileName);
          setUploadProgress(Math.round(((uploadedFiles + 1) / totalFiles) * 100));

          const { file_url } = await UploadFile({ file });
          const fileType = getFileType(file.type);

          await Asset.create({
            title: fileName,
            file_url: file_url,
            file_type: fileType,
            file_size: file.size,
            mime_type: file.type,
            tags: [],
            company_id: currentCompany.id,
            parent_folder_id: currentParentId,
            created_by: user?.email, // Ensure created_by is set
          });

          uploadedFiles++;
        }
      }

      setUploadProgress(100);
      await loadAssets();
    } catch (error) {
      console.error("Failed to upload folder:", error);
      alert(`Failed to upload folder: ${error.message}`);
    }

    setIsUploading(false);
    setUploadProgress(0);
    setUploadingFileName("");

    // Reset the input
    if (event.target) {
      event.target.value = '';
    }
  };

  const getFileType = (mimeType) => {
    if (!mimeType) return 'document';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !currentCompany) return;

    try {
      await Asset.create({
        title: newFolderName,
        file_type: 'folder',
        company_id: currentCompany.id,
        parent_folder_id: currentFolder?.id || null,
        created_by: user?.email, // Ensure created_by is set
      });

      setNewFolderName("");
      setIsCreateFolderOpen(false);
      await loadAssets();
    } catch (error) {
      console.error("Failed to create folder:", error);
      alert("Failed to create folder. Please try again.");
    }
  };

  const handleRename = async () => {
    if (!renameValue.trim() || !selectedAsset) return;

    try {
      await Asset.update(selectedAsset.id, { title: renameValue });
      setRenameValue("");
      setSelectedAsset(null);
      setIsRenameOpen(false);
      await loadAssets();
    } catch (error) {
      console.error("Failed to rename asset:", error);
      alert("Failed to rename asset. Please try again.");
    }
  };

  const handleDelete = async (asset) => {
    if (!confirm(`Are you sure you want to delete "${asset.title}"?`)) return;

    try {
      await Asset.delete(asset.id);
      await loadAssets();
    } catch (error) {
      console.error("Failed to delete asset:", error);
      alert("Failed to delete asset. Please try again.");
    }
  };

  const handleShare = (asset) => {
    if (asset.file_url) {
      navigator.clipboard.writeText(asset.file_url);
      alert("Link copied to clipboard!");
    }
  };

  const navigateToFolder = (folder) => {
    setCurrentFolder(folder);
    setFolderPath([...folderPath, folder]);
  };

  const navigateBack = () => {
    const newPath = [...folderPath];
    newPath.pop();
    setFolderPath(newPath);
    setCurrentFolder(newPath.length > 0 ? newPath[newPath.length - 1] : null);
  };

  const handleAssetDoubleClick = (asset) => {
    if (asset.file_type === 'folder') {
      navigateToFolder(asset);
    } else if (asset.file_type === 'image' && asset.file_url) {
      setPreviewImage(asset);
      setIsPreviewOpen(true);
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(searchTerm.toLowerCase());
    // Filter logic has been simplified as the separate filter buttons were removed from the UI.
    // The current filter state is still maintained but not exposed directly via category buttons.
    // However, the outline removed the UI elements that set `filter` based on type,
    // so `matchesFilter` will always be true if the `filter` state is always "all".
    // If the intention is to completely remove type-based filtering, this line might be removed.
    // Given the outline, I'll keep the `filter` state and the `matchesFilter` variable,
    // but the UI interaction for `filter` is gone from the main filters bar.
    const matchesFilter = filter === "all" || asset.file_type === filter;
    return matchesSearch && matchesFilter;
  });

  const getFileIcon = (asset) => {
    if (asset.file_type === 'folder') return Folder;

    switch (asset.file_type) {
      case "image": return Image;
      case "video": return Video;
      case "audio": return Music;
      case "document": return FileText;
      default: return Archive;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const assetCounts = {
    all: assets.length,
    folder: assets.filter(a => a.file_type === 'folder').length,
    image: assets.filter(a => a.file_type === 'image').length,
    video: assets.filter(a => a.file_type === 'video').length,
    document: assets.filter(a => a.file_type === 'document').length,
    audio: assets.filter(a => a.file_type === 'audio').length
  };

  const canUserModify = (asset) => {
    return user && (asset.created_by === user.email || user.role === 'admin');
  };

  if (isLoading) {
    return <Loader message="Loading your assets..." />;
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Assets Library</h1>
            <p className="text-gray-600">Manage and organize your marketing assets, brand materials, and media files</p>
          </div>

          <div className="flex gap-3">
            {/* File Upload */}
            <input
              type="file"
              multiple
              accept="*/*"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={isUploading || !currentCompany}
            />
            <label htmlFor="file-upload">
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 cursor-pointer"
                disabled={isUploading || !currentCompany}
                asChild
              >
                <span>
                  <Upload className="w-4 h-4" />
                  {isUploading ? "Uploading..." : "Upload Files"}
                </span>
              </Button>
            </label>

            {/* Folder Upload */}
            <input
              type="file"
              multiple
              webkitdirectory=""
              directory=""
              onChange={handleFolderUpload}
              className="hidden"
              id="folder-upload"
              disabled={isUploading || !currentCompany}
            />
            <label htmlFor="folder-upload">
              <Button
                variant="outline"
                className="flex items-center gap-2 cursor-pointer"
                disabled={isUploading || !currentCompany}
                asChild
              >
                <span>
                  <FolderOpen className="w-4 h-4" />
                  Upload Folder
                </span>
              </Button>
            </label>

            {/* Create Folder */}
            <Button
              variant="outline"
              onClick={() => setIsCreateFolderOpen(true)}
              disabled={!currentCompany}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900">
                  Uploading: {uploadingFileName}
                </span>
                <span className="text-sm text-purple-700">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Breadcrumb Navigation */}
        {folderPath.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Button variant="ghost" size="sm" onClick={() => { setCurrentFolder(null); setFolderPath([]); }}>
              <FolderOpen className="w-4 h-4 mr-1" />
              Assets
            </Button>
            {folderPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <span>/</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newPath = folderPath.slice(0, index + 1);
                    setFolderPath(newPath);
                    setCurrentFolder(folder);
                  }}
                >
                  {folder.title}
                </Button>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Back Button */}
        {currentFolder && (
          <Button variant="outline" onClick={navigateBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: "All Items", count: assetCounts.all, icon: Archive, color: "purple" },
            { label: "Folders", count: assetCounts.folder, icon: Folder, color: "blue" },
            { label: "Images", count: assetCounts.image, icon: Image, color: "green" },
            { label: "Videos", count: assetCounts.video, icon: Video, color: "red" },
            { label: "Documents", count: assetCounts.document, icon: FileText, color: "orange" },
            { label: "Audio", count: assetCounts.audio, icon: Music, color: "pink" }
          ].map((stat, index) => (
            <Card key={index} className="shadow-sm border-0 bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">{stat.count}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-grow max-w-md">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-gray-200"
            />
          </div>

          {/* Type filter buttons previously here were removed per outline. The 'filter' state is still available but no UI to change it. */}
          {/* If type filtering UI is desired, it would need to be re-added here. */}

          <div className="flex items-center gap-3">
            {/* Ownership Filter */}
            <Select value={ownershipFilter} onValueChange={(value) => {setOwnershipFilter(value); loadAssets();}}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Files</SelectItem>
                <SelectItem value="my_files">My Files Only</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setView(view === "grid" ? "list" : "grid")}
              className="flex items-center gap-2"
            >
              {view === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              {view === "grid" ? "List View" : "Grid View"}
            </Button>
          </div>
        </div>

        {/* Assets Display */}
        {filteredAssets.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Upload your first asset to get started"
              }
            </p>
            {!searchTerm && filter === "all" && (
              <div className="space-y-2">
                <label htmlFor="file-upload">
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer mr-2"
                    asChild
                    disabled={!currentCompany}
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Files
                    </span>
                  </Button>
                </label>
                <Button variant="outline" onClick={() => setIsCreateFolderOpen(true)} disabled={!currentCompany}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Folder
                </Button>
              </div>
            )}
          </div>
        )}

        {filteredAssets.length > 0 && (view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredAssets.map((asset) => {
              const FileIcon = getFileIcon(asset);
              const userCanModify = canUserModify(asset);
              return (
                <Card key={asset.id} className="shadow-sm border-0 bg-white hover:shadow-md transition-shadow group">
                  <CardContent className="p-2">
                    <div
                      className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden cursor-pointer"
                      onDoubleClick={() => handleAssetDoubleClick(asset)}
                    >
                      {asset.file_type === "image" && asset.file_url ? (
                        <img
                          src={asset.file_url}
                          alt={asset.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileIcon className={`w-8 h-8 ${
                          asset.file_type === 'folder' ? 'text-blue-500' : 'text-gray-400'
                        }`} />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-start justify-between">
                        <h4
                          className="font-medium text-gray-900 text-xs truncate flex-1 mr-1 cursor-pointer"
                          onDoubleClick={() => handleAssetDoubleClick(asset)}
                          title={asset.title}
                        >
                          {asset.title}
                        </h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {asset.file_url && (
                              <>
                                <DropdownMenuItem onClick={() => handleAssetDoubleClick(asset)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a href={asset.file_url} download>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleShare(asset)}>
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                              </>
                            )}
                            {userCanModify && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAsset(asset);
                                    setRenameValue(asset.title);
                                    setIsRenameOpen(true);
                                  }}
                                >
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(asset)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] capitalize px-1 py-0">
                          {asset.file_type}
                        </Badge>
                        {asset.file_size && (
                          <span className="text-[10px] text-gray-500">
                            {formatFileSize(asset.file_size)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {filteredAssets.map((asset) => {
                  const FileIcon = getFileIcon(asset);
                  const userCanModify = canUserModify(asset);
                  return (
                    <div key={asset.id} className="p-4 hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer"
                          onDoubleClick={() => handleAssetDoubleClick(asset)}
                        >
                          {asset.file_type === "image" && asset.file_url ? (
                            <img
                              src={asset.file_url}
                              alt={asset.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <FileIcon className={`w-6 h-6 ${
                              asset.file_type === 'folder' ? 'text-blue-500' : 'text-gray-400'
                            }`} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4
                            className="font-medium text-gray-900 truncate cursor-pointer"
                            onDoubleClick={() => handleAssetDoubleClick(asset)}
                          >
                            {asset.title}
                          </h4>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {asset.file_type}
                            </Badge>
                            {asset.file_size && (
                              <span className="text-sm text-gray-500">
                                {formatFileSize(asset.file_size)}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              by {asset.created_by === user?.email ? 'You' : asset.created_by}
                            </span>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {asset.file_url && (
                              <>
                                <DropdownMenuItem onClick={() => handleAssetDoubleClick(asset)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a href={asset.file_url} download>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleShare(asset)}>
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                              </>
                            )}
                            {userCanModify && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAsset(asset);
                                    setRenameValue(asset.title);
                                    setIsRenameOpen(true);
                                  }}
                                >
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(asset)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Folder Modal */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name..."
                className="mt-2"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create Folder
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Modal */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rename {selectedAsset?.file_type === 'folder' ? 'Folder' : 'File'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rename">New Name</Label>
              <Input
                id="rename"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Enter new name..."
                className="mt-2"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!renameValue.trim()}>
              Rename
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewImage?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {previewImage?.file_url && (
              <img
                src={previewImage.file_url}
                alt={previewImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
