import fetch from '@/config/fetch'

/**
 * 登陆
 */
export const login = data => fetch('/user/admin/login', data, 'POST');

/**
 * 退出
 */
export const signout = () => fetch('/admin/singout');

/**
 * 获取用户列表
 */
export const getUserList = data => fetch('/user/list', data);

/**
 * 获取用户数量
 */
export const getUserCount = data => fetch('/user/count', data);

/**
 * 根据父节点id获取子类列表分类信息
 */
export const getCategoryByParentId = parentId => fetch('/category/children/list', parentId);

/**
 * 删除上传的文件
 */
export const deleteFile = data => fetch('/upload/file', data, 'DELETE');

/**
 * 增加商品参数规格
 */
export const addItemParam = data => fetch('/item/param/add', data, 'POST');

/**
 * 根据商品分类id得到商品参数,判断是否存在
 */
export const checkItemParamByItemCatId = itemCatId => fetch('/item/param/checkCid/' + itemCatId, {}, 'GET');

/**
 * 根据cid得到商品规格
 */
export const getItemParamByCid = itemCatId => fetch('/item/param/' + itemCatId, {}, 'GET');

/**
 * 添加商品
 */
export const addItem = data => fetch('/item/add', data, 'POST');

/**
 * 更新商品
 */
export const updateItem = data => fetch('/item/update', data, 'PUT');

/**
 * 更新商品参数规格
 */
export const updateItemParam = data => fetch('/item/param/update', data, 'PUT');

/**
 * 获得商品列表
 */
export const getItemList = data => fetch('/item/list', data, 'GET');

/**
 * 根据标题得到商品列表
 */
export const getItemListLikeTitle = data => fetch('/item/list/likeTitle', data, 'GET');

/**
 * 刪除商品
 */
export const deleteItemAll = data => fetch('/item/delete', data, 'DELETE');

/**
 * 刪除商品参数
 */
export const deleteItemParam = data => fetch('/item/param/delete', data, 'DELETE');

/**
 * 更新商品状态（上架，下架）
 */
export const updateItemStatus = data => fetch('/item/status/update', data, 'PUT');

/**
 * 根据商品id得到商品描述
 */
export const getItemDescById = itemId => fetch('/item/desc/' + itemId, {}, 'GET');

/**
 * 根据商品id得到商品规格
 */
export const getItemParamItemByItemId = itemId => fetch('/item/paramItem/' + itemId, {}, 'GET');

/**
 * 获得商品规格列表带着category, 默认按更新时间倒序排列
 */
export const getItemParamListWithCid = data => fetch('/item/param/list', data, 'GET');

/**
 * 根据分类名字得到商品规格, 默认按更新时间倒序排列
 */
export const getItemListWithCidLikeCidName = data => fetch('/item/param/list/likeCidName', data, 'GET');

/**
 * 根据父类id得到内容分类
 */
export const getContentCategoryByParentId = parentId => fetch('/content/category', parentId, 'GET');

/**
 * 插入内容分类
 */
export const insertContentCategory = data => fetch('/content/category', data, 'POST');

/**
 * 删除内容分类
 */
export const deleteContentCategory = id => fetch('/content/category/' + id, {}, 'DELETE');

/**
 * 更新内容分类
 */
export const updateContentCategory = data => fetch('/content/category', data, 'PUT');

/**
 * 获得内容列表带着category, 默认按更新时间倒序排列
 */
export const getContentListWithCid = data => fetch('/content/list', data, 'GET');

/**
 * 插入内容
 */
export const insertContent = data => fetch('/content/add', data, 'POST');

/**
 * 删除内容
 */
export const deleteContent = data => fetch('/content/delete', data, 'DELETE');

/**
 * 更新内容
 */
export const updateContent = data => fetch('/content/update', data, 'PUT');
